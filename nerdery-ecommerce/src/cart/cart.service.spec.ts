import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { CartItemWithFullDetails } from 'src/common/prisma-types';
import { ProductCalculatedFieldsService } from 'src/common/services/product-calculations/product-calculated-fields.service';
import {
  validCartItemsWithProductVariationProductAndImages,
  validUUID7,
} from 'src/common/testing-mocks/helper-data';
import { PrismaService } from 'src/prisma/prisma.service';

import { CartService } from './cart.service';
import { CartObject } from './entities/cart.entity';
const mockPrismaServiceInit = {
  cartItem: {
    deleteMany: jest.fn(),
    findMany: jest.fn(),
  },
};
describe('CartService', () => {
  let service: CartService;
  // let prismaService: DeepMocked<PrismaService>;
  let prismaService: typeof mockPrismaServiceInit;
  let productCalculatedFieldsService: DeepMocked<ProductCalculatedFieldsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: PrismaService, useValue: mockPrismaServiceInit },
        {
          provide: ProductCalculatedFieldsService,
          useValue: createMock<ProductCalculatedFieldsService>(),
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    prismaService = module.get(PrismaService);
    productCalculatedFieldsService = module.get(ProductCalculatedFieldsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(productCalculatedFieldsService).toBeDefined();
  });

  const productVariationId1 =
    validCartItemsWithProductVariationProductAndImages[0].productVariationId;
  const productVariationId2 =
    validCartItemsWithProductVariationProductAndImages[1].productVariationId;
  const userId = validUUID7;

  describe('myCart', () => {
    beforeEach(() => {
      productCalculatedFieldsService.createCartItemWithPriceSummary.mockReset();
      prismaService.cartItem.findMany.mockReset();
    });

    it('should return a populated CartObject with valid cart items', async () => {
      const userCart: CartItemWithFullDetails[] = [
        {
          ...validCartItemsWithProductVariationProductAndImages[0],
          userId: userId,
        },
        {
          ...validCartItemsWithProductVariationProductAndImages[1],
          userId: userId,
        },
      ];
      prismaService.cartItem.findMany.mockResolvedValue(userCart);

      const expectedCartItem1 = {
        productVariationId: productVariationId1,
        userId: userId,
        quantity: 2,
        unitPrice: 73.65,
        subTotal: 147.3,
        discount: 14.73,
        total: 132.57,
      };

      const expectedCartItem2 = {
        productVariationId: productVariationId2,
        userId: userId,
        quantity: 3,
        unitPrice: 46.59,
        subTotal: 139.77,
        discount: 6.99,
        total: 132.78,
      };
      productCalculatedFieldsService.createCartItemWithPriceSummary.mockReturnValueOnce(
        expectedCartItem1,
      );
      productCalculatedFieldsService.createCartItemWithPriceSummary.mockReturnValueOnce(
        expectedCartItem2,
      );

      const expectedResult: any = {
        subTotal: 287.07,
        discount: 21.72,
        total: 265.35,
        items: [expectedCartItem1, expectedCartItem2],
      };

      const result = await service.myCart(userId);

      expect(prismaService.cartItem.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: {
          productVariation: {
            include: {
              product: true,
              variationImages: true,
            },
          },
        },
      });

      expect(productCalculatedFieldsService.createCartItemWithPriceSummary).toHaveBeenCalledTimes(
        2,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should return an empty CartObject if user has no cart items', async () => {
      prismaService.cartItem.findMany.mockResolvedValue([]);

      const expectedCartObject: CartObject = {
        items: [],
        discount: 0,
        subTotal: 0,
        total: 0,
      };

      const result = await service.myCart(userId);

      expect(prismaService.cartItem.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: {
          productVariation: {
            include: {
              product: true,
              variationImages: true,
            },
          },
        },
      });

      expect(productCalculatedFieldsService.createCartItemWithPriceSummary).not.toHaveBeenCalled();

      expect(result).toEqual(expectedCartObject);
    });

    it('should handle cart items with invalid variations by filtering them out', async () => {
      prismaService.cartItem.findMany.mockResolvedValue([
        {
          ...validCartItemsWithProductVariationProductAndImages[0],
          userId: userId,
          productVariation: {
            ...validCartItemsWithProductVariationProductAndImages[0].productVariation,
            isEnabled: false,
          },
        },
        {
          ...validCartItemsWithProductVariationProductAndImages[1],
          userId: userId,
          productVariation: {
            ...validCartItemsWithProductVariationProductAndImages[1].productVariation,
            isDeleted: true,
          },
        },
        {
          ...validCartItemsWithProductVariationProductAndImages[1],
          userId: userId,
          productVariation: {
            ...validCartItemsWithProductVariationProductAndImages[1].productVariation,
            stock: 0,
          },
        },
        {
          ...validCartItemsWithProductVariationProductAndImages[1],
          userId: userId,
          quantity: 10,
          productVariation: {
            ...validCartItemsWithProductVariationProductAndImages[1].productVariation,
            stock: 5,
          },
        },
      ]);

      const expectedCartObject: CartObject = {
        items: [],
        discount: 0,
        subTotal: 0,
        total: 0,
      };

      const result = await service.myCart(userId);

      expect(productCalculatedFieldsService.createCartItemWithPriceSummary).not.toHaveBeenCalled();

      expect(result).toEqual(expectedCartObject);
    });

    it('should handle Prisma errors', async () => {
      prismaService.cartItem.findMany.mockRejectedValue(new Error('Database error'));

      await expect(service.myCart(userId)).rejects.toThrow('Database error');

      expect(prismaService.cartItem.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: {
          productVariation: {
            include: {
              product: true,
              variationImages: true,
            },
          },
        },
      });

      expect(productCalculatedFieldsService.createCartItemWithPriceSummary).not.toHaveBeenCalled();
    });
  });

  describe('deleteAllItems', () => {
    it('should delete all specified cart items and return the count', async () => {
      const productVariationIds = [productVariationId1, productVariationId2];

      prismaService.cartItem.deleteMany.mockResolvedValue({ count: 2 });

      const result = await service.deleteAllItems(userId, productVariationIds);

      expect(prismaService.cartItem.deleteMany).toHaveBeenCalledWith({
        where: {
          userId,
          productVariationId: {
            in: productVariationIds,
          },
        },
      });
      expect(result).toBe(2);
    });

    it('should return 0 if no cart items match the criteria', async () => {
      prismaService.cartItem.deleteMany.mockResolvedValue({ count: 0 });

      const result = await service.deleteAllItems(userId, ['nonexistent-id']);

      expect(prismaService.cartItem.deleteMany).toHaveBeenCalledWith({
        where: {
          userId,
          productVariationId: {
            in: ['nonexistent-id'],
          },
        },
      });

      expect(result).toBe(0);
    });

    it('should handle Prisma errors by throwing an error', async () => {
      const productVariationIds = [productVariationId1, productVariationId2];
      prismaService.cartItem.deleteMany.mockRejectedValue(new Error('Database error'));

      await expect(service.deleteAllItems(userId, productVariationIds)).rejects.toThrow(
        'Database error',
      );

      expect(prismaService.cartItem.deleteMany).toHaveBeenCalledWith({
        where: {
          userId,
          productVariationId: {
            in: productVariationIds,
          },
        },
      });
    });
  });
});
