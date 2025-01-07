import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductVariation } from '@prisma/client';
import { CartItemObject } from 'src/cart-items/entities/cart-item.object';
import {
  validProductVariation1,
  validProductVariation2,
  validUUID6,
} from 'src/common/testing-mocks/helper-data';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';

import { StockReservationManagementService } from './stock-reservation-management.service';

const mockPrismaServiceInit = {
  productVariation: {
    update: jest.fn(),
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('StockReservationManagementService', () => {
  let service: StockReservationManagementService;
  let prismaService: typeof mockPrismaServiceInit;
  let mailService: DeepMocked<MailService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockReservationManagementService,
        { provide: PrismaService, useValue: mockPrismaServiceInit },
        { provide: MailService, useValue: createMock<MailService>() },
      ],
    }).compile();

    service = module.get<StockReservationManagementService>(StockReservationManagementService);
    prismaService = module.get(PrismaService);
    mailService = module.get(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(mailService).toBeDefined();
  });

  describe('reserveStock', () => {
    beforeEach(() => {
      prismaService.productVariation.update.mockReset();
      prismaService.productVariation.findMany.mockReset();
      prismaService.$transaction.mockReset();
      mailService.sendLowStockEmailInitProcess.mockImplementation();
    });

    const cartItems: CartItemObject[] = [
      {
        productVariationId: validProductVariation1.id,
        quantity: 2,
        userId: validUUID6,
        unitPrice: 50,
        subTotal: 100,
        total: 100,
        discount: 0,
      },
      {
        productVariationId: validProductVariation2.id,
        quantity: 1,
        userId: validUUID6,
        unitPrice: 30,
        subTotal: 30,
        total: 30,
        discount: 0,
      },
    ];

    it('should reserve stock for all cart items successfully', async () => {
      jest.spyOn(prismaService.productVariation, 'findMany').mockResolvedValueOnce([
        { ...validProductVariation1, stock: 2 },
        { ...validProductVariation2, stock: 7 },
      ]);

      // Mock MailService.sendLowStockEmailInitProcess
      mailService.sendLowStockEmailInitProcess.mockImplementation();

      await service.reserveStock(cartItems);

      // Verify stock updates
      expect(prismaService.productVariation.update).toHaveBeenCalledTimes(2);
      expect(prismaService.productVariation.update).toHaveBeenNthCalledWith(1, {
        where: { id: validProductVariation1.id },
        data: { stock: { decrement: 2 } },
      });
      expect(prismaService.productVariation.update).toHaveBeenNthCalledWith(2, {
        where: { id: validProductVariation2.id },
        data: { stock: { decrement: 1 } },
      });

      expect(mailService.sendLowStockEmailInitProcess).toHaveBeenCalledTimes(1);
      expect(mailService.sendLowStockEmailInitProcess).toHaveBeenCalledWith({
        ...validProductVariation1,
        stock: 2,
      });
    });

    it('should send low stock email only when stock is below threshold and above zero', async () => {
      const var1 = { ...validProductVariation1, stock: 2 };
      const var2 = { ...validProductVariation2, stock: 7 };
      jest.spyOn(prismaService.productVariation, 'findMany').mockResolvedValueOnce([var1, var2]);
      jest
        .spyOn(prismaService.productVariation, 'update')
        .mockResolvedValueOnce(var1) // Should trigger email
        .mockResolvedValueOnce(var2); // Should not trigger email

      mailService.sendLowStockEmailInitProcess.mockImplementation();

      await service.reserveStock(cartItems);

      expect(mailService.sendLowStockEmailInitProcess).toHaveBeenCalledTimes(1);
      expect(mailService.sendLowStockEmailInitProcess).toHaveBeenCalledWith(var1);
    });

    it('should handle Prisma update failures', async () => {
      jest.spyOn(prismaService, '$transaction').mockRejectedValue(new Error('Database error'));

      await expect(service.reserveStock(cartItems)).rejects.toThrow(ConflictException);

      expect(prismaService.productVariation.update).toHaveBeenCalledTimes(2);
      expect(prismaService.productVariation.findMany).toHaveBeenCalledTimes(0);
      expect(mailService.sendLowStockEmailInitProcess).toHaveBeenCalledTimes(0);
    });

    it('should not send low stock email if stock is above threshold', async () => {
      const var1: ProductVariation = { ...validProductVariation1, stock: 6 };
      const var2: ProductVariation = { ...validProductVariation2, stock: 24 };
      jest
        .spyOn(prismaService.productVariation, 'update')
        .mockResolvedValueOnce(var1)
        .mockResolvedValueOnce(var2);
      jest.spyOn(prismaService.productVariation, 'findMany').mockResolvedValueOnce([var1, var2]);

      mailService.sendLowStockEmailInitProcess.mockImplementation();

      await service.reserveStock(cartItems);

      expect(mailService.sendLowStockEmailInitProcess).not.toHaveBeenCalled();
    });

    it('should handle empty cart items with ConflictException error', async () => {
      await expect(service.reserveStock([])).rejects.toThrow(
        new ConflictException('Error reserving stock - cart is empty'),
      );

      expect(prismaService.productVariation.update).not.toHaveBeenCalled();
      expect(mailService.sendLowStockEmailInitProcess).not.toHaveBeenCalled();
    });
  });
});
