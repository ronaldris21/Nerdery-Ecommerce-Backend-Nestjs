import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CartItem, Prisma } from '@prisma/client';
import { DiscountType } from 'src/common/data/enums/discount-type.enum';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { ProductVariationWithProductAndImages } from 'src/common/prisma-types';
import { IdValidatorService } from 'src/common/services/id-validator/id-validator.service';
import { ProductCalculatedFieldsService } from 'src/common/services/product-calculations/product-calculated-fields.service';
import {
  validProduct1,
  validProductVariation1,
  validUUID1,
  validUUID2,
  validUUID6,
} from 'src/common/testing-mocks/helper-data';

import { CartItemsService } from './cart-items.service';
import { CartItemInput } from './dto/cart-item.input';

const mockPrismaServiceInit = {
  cartItem: {
    upsert: jest.fn(),
    delete: jest.fn(),
  },
};

describe('CartItemsService', () => {
  let service: CartItemsService;
  let prismaService: typeof mockPrismaServiceInit;
  let idValidatorService: DeepMocked<IdValidatorService>;
  let productCalculatedFieldsService: DeepMocked<ProductCalculatedFieldsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartItemsService,
        { provide: PrismaService, useValue: mockPrismaServiceInit },
        {
          provide: IdValidatorService,
          useValue: createMock<IdValidatorService>(),
        },
        {
          provide: ProductCalculatedFieldsService,
          useValue: createMock<ProductCalculatedFieldsService>(),
        },
      ],
    }).compile();

    service = module.get<CartItemsService>(CartItemsService);
    prismaService = module.get(PrismaService);
    idValidatorService = module.get(IdValidatorService);
    productCalculatedFieldsService = module.get(ProductCalculatedFieldsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(idValidatorService).toBeDefined();
    expect(productCalculatedFieldsService).toBeDefined();
  });

  const userId = validUUID6;
  const productId = validUUID1;
  const productVariationId = validUUID2;

  const createInput: CartItemInput = {
    productVariationId: productVariationId,
    quantity: 3,
  };

  const validCartItem: CartItem = {
    userId: userId,
    productVariationId: productVariationId,
    quantity: 3,
  };

  const productVariationWithDetails: ProductVariationWithProductAndImages = {
    ...validProductVariation1,
    price: new Prisma.Decimal(100),
    discount: new Prisma.Decimal(10),
    discountType: DiscountType.PERCENTAGE,
    product: {
      ...validProduct1,
      id: productId,
    },
    variationImages: [],
  };

  describe('createOrUpdate', () => {
    beforeEach(() => {
      prismaService.cartItem.upsert.mockReset();
      idValidatorService.findUniqueProductVariationById.mockReset();
      productCalculatedFieldsService.createCartItemWithPriceSummary.mockReset();
    });

    it('should create a new cart item successfully', async () => {
      const createdCartItem = validCartItem;
      idValidatorService.findUniqueProductVariationById.mockResolvedValue(
        productVariationWithDetails,
      );
      prismaService.cartItem.upsert.mockResolvedValue(createdCartItem);
      const cartItemWithSummary = {
        ...createdCartItem,
        unitPrice: 100,
        subTotal: 300,
        discount: 30,
        total: 270,
      };
      productCalculatedFieldsService.createCartItemWithPriceSummary.mockReturnValue(
        cartItemWithSummary,
      );

      const result = await service.createOrUpdate(createInput, userId);

      expect(idValidatorService.findUniqueProductVariationById).toHaveBeenCalledWith(
        { id: productVariationId },
        true,
      );
      expect(prismaService.cartItem.upsert).toHaveBeenCalledWith({
        where: {
          userId_productVariationId: {
            userId: userId,
            productVariationId: productVariationId,
          },
        },
        update: {
          quantity: createInput.quantity,
        },
        create: {
          userId: userId,
          quantity: createInput.quantity,
          productVariationId: productVariationId,
        },
      });
      expect(productCalculatedFieldsService.createCartItemWithPriceSummary).toHaveBeenCalledWith(
        createdCartItem,
        productVariationWithDetails,
      );
      expect(result).toEqual(cartItemWithSummary);
    });

    it('should update an existing cart item successfully', async () => {
      const existingCartItem = validCartItem;
      const updateInput: CartItemInput = {
        productVariationId: productVariationId,
        quantity: 4,
      };
      idValidatorService.findUniqueProductVariationById.mockResolvedValue(
        productVariationWithDetails,
      );
      prismaService.cartItem.upsert.mockResolvedValue(existingCartItem);
      const updatedCartItemWithSummary = {
        ...existingCartItem,
        quantity: createInput.quantity,
        unitPrice: 100,
        subTotal: 400,
        discount: 40,
        total: 360,
      };
      productCalculatedFieldsService.createCartItemWithPriceSummary.mockReturnValue(
        updatedCartItemWithSummary,
      );

      const result = await service.createOrUpdate(updateInput, userId);

      expect(idValidatorService.findUniqueProductVariationById).toHaveBeenCalledWith(
        { id: productVariationId },
        true,
      );
      expect(prismaService.cartItem.upsert).toHaveBeenCalledWith({
        where: {
          userId_productVariationId: {
            userId: userId,
            productVariationId: productVariationId,
          },
        },
        update: {
          quantity: updateInput.quantity,
        },
        create: {
          userId: userId,
          quantity: updateInput.quantity,
          productVariationId: productVariationId,
        },
      });
      expect(productCalculatedFieldsService.createCartItemWithPriceSummary).toHaveBeenCalledWith(
        existingCartItem,
        productVariationWithDetails,
      );
      expect(result).toEqual(updatedCartItemWithSummary);
    });

    it('should throw ConflictException if product or variation is not enabled or is deleted', async () => {
      const disabledProductVariation = {
        ...productVariationWithDetails,
        isEnabled: false,
      };
      idValidatorService.findUniqueProductVariationById.mockResolvedValue(disabledProductVariation);

      await expect(service.createOrUpdate(createInput, userId)).rejects.toThrow(ConflictException);

      expect(idValidatorService.findUniqueProductVariationById).toHaveBeenCalledWith(
        { id: productVariationId },
        true,
      );
      expect(prismaService.cartItem.upsert).not.toHaveBeenCalled();
      expect(productCalculatedFieldsService.createCartItemWithPriceSummary).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if quantity exceeds stock', async () => {
      const insufficientStockVariation = {
        ...productVariationWithDetails,
        stock: 2,
      };
      idValidatorService.findUniqueProductVariationById.mockResolvedValue(
        insufficientStockVariation,
      );

      const highQuantityInput: CartItemInput = {
        productVariationId: productVariationId,
        quantity: 3,
      };

      await expect(service.createOrUpdate(highQuantityInput, userId)).rejects.toThrow(
        ConflictException,
      );

      expect(idValidatorService.findUniqueProductVariationById).toHaveBeenCalledWith(
        { id: productVariationId },
        true,
      );
      expect(prismaService.cartItem.upsert).not.toHaveBeenCalled();
      expect(productCalculatedFieldsService.createCartItemWithPriceSummary).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      prismaService.cartItem.delete.mockReset();
    });
    it('should delete a cart item successfully and return 204 status code', async () => {
      prismaService.cartItem.delete.mockResolvedValue(validCartItem);

      const result = await service.delete(userId, productVariationId);

      expect(prismaService.cartItem.delete).toHaveBeenCalledWith({
        where: {
          userId_productVariationId: {
            userId: userId,
            productVariationId: productVariationId,
          },
        },
      });

      expect(result.statusCode).toEqual(204);
    });

    it('should throw NotFoundException if cart item does not exist or database error', async () => {
      const productVariationIdInexistent = 'nonexistent-variation-id';
      prismaService.cartItem.delete.mockRejectedValue(new Error('Database error'));

      await expect(service.delete(userId, productVariationIdInexistent)).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaService.cartItem.delete).toHaveBeenCalledWith({
        where: {
          userId_productVariationId: {
            userId: userId,
            productVariationId: productVariationIdInexistent,
          },
        },
      });
    });
  });
});
