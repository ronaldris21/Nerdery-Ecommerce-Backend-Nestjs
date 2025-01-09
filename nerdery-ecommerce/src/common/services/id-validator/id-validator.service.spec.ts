import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, Product, ProductVariation } from '@prisma/client';
import { DiscountType } from 'src/common/data/enums/discount-type.enum';
import { Gender } from 'src/common/data/enums/gender.enum';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { validUUID1, validUUID2, validUUID3 } from 'src/common/testing-mocks/helper-data';

import { IdValidatorService } from './id-validator.service';

const mockPrismaServiceInit = {
  product: {
    findUnique: jest.fn(),
  },
  productVariation: {
    findUnique: jest.fn(),
  },
};

const validProduct: Product = {
  id: validUUID1,
  categoryId: validUUID2,
  gender: Gender.KIDS,
  description: 'A nice product',
  name: 'Product',
  thumbnailUrl: 'http://thumbnail.url',
  isDeleted: false,
  isEnabled: true,
  minPrice: new Prisma.Decimal(100.0),
  maxPrice: new Prisma.Decimal(150.0),
  likesCount: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const validProductVariation: ProductVariation = {
  id: validUUID3,
  productId: validUUID1,
  price: new Prisma.Decimal(100.0),
  discount: new Prisma.Decimal(0),
  discountType: DiscountType.PERCENTAGE,
  isEnabled: true,
  isDeleted: false,
  color: 'Red',
  size: 'M',
  stock: 10,
  stockRefilledAt: new Date(),
};

describe('IdValidatorService', () => {
  let service: IdValidatorService;
  let prismaService: typeof mockPrismaServiceInit;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IdValidatorService, { provide: PrismaService, useValue: mockPrismaServiceInit }],
    }).compile();

    service = module.get<IdValidatorService>(IdValidatorService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('findUniqueProductById', () => {
    it('should return the product when is found by id', async () => {
      const where = { id: validUUID1 };

      prismaService.product.findUnique.mockResolvedValue(validProduct);

      const result = await service.findUniqueProductById(where);

      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where,
      });
      expect(result).toEqual({
        ...validProduct,
      });
    });

    it('should throw NotFoundException when product is not found', async () => {
      const where = { id: 'prod-3' };
      prismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findUniqueProductById(where)).rejects.toThrow(NotFoundException);
      expect(prismaService.product.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where,
        }),
      );
    });

    it('should handle Prisma errors', async () => {
      const where = { id: 'prod-4' };
      prismaService.product.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(service.findUniqueProductById(where)).rejects.toThrow('Database error');
      expect(prismaService.product.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where,
        }),
      );
    });
  });

  describe('findUniqueProductVariationById', () => {
    it('should return the product variation when is found', async () => {
      const where = { id: validUUID3 };
      prismaService.productVariation.findUnique.mockResolvedValue(validProductVariation);

      const result = await service.findUniqueProductVariationById(where);

      expect(prismaService.productVariation.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where,
        }),
      );
      expect(result).toEqual(validProductVariation);
    });

    it('should throw NotFoundException when product variation is not found', async () => {
      const where = { id: 'var-3' };
      prismaService.productVariation.findUnique.mockResolvedValue(null);

      await expect(service.findUniqueProductVariationById(where)).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaService.productVariation.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where,
        }),
      );
    });

    it('should throw NotFoundException on Prisma errors', async () => {
      const where = { id: 'var-4' };
      prismaService.productVariation.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(service.findUniqueProductVariationById(where)).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaService.productVariation.findUnique).toHaveBeenCalledWith({
        where,
      });
    });
  });
});
