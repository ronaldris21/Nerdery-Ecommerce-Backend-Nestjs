import { Test, TestingModule } from '@nestjs/testing';
import { CartItem, Product, ProductVariation } from '@prisma/client';
import Decimal from 'decimal.js';
import { PriceSummaryInput } from 'src/common/data/dto/price-summary-input.dto ';
import { PriceSummary } from 'src/common/data/dto/price-summary.dto';
import { DiscountType } from 'src/common/data/enums/discount-type.enum';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { ProductWithLikes } from 'src/common/prisma-types';
import {
  validProduct1,
  validProduct2,
  validProductVariation1,
  validUUID1,
  validUUID2,
  validUUID3,
  validUUID7,
  validUUID8,
} from 'src/common/testing-mocks/helper-data';

import { ProductCalculatedFieldsService } from './product-calculated-fields.service';

const mockPrismaServiceInit = {
  product: {
    update: jest.fn(),
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
};
describe('ProductCalculatedFieldsService', () => {
  let service: ProductCalculatedFieldsService;
  let prismaService: typeof mockPrismaServiceInit;

  const productId1 = validUUID1;
  const productId2 = validUUID2;
  const productId3 = validUUID3;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductCalculatedFieldsService,
        { provide: PrismaService, useValue: mockPrismaServiceInit },
      ],
    }).compile();

    service = module.get<ProductCalculatedFieldsService>(ProductCalculatedFieldsService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('recalculateProductMinMaxPrices', () => {
    type ProductWithVariations = Product & {
      productVariations: ProductVariation[];
    };

    const productWithVariation1: ProductWithVariations = {
      id: productId1,
      name: 'Running Shoes',
      gender: 'UNISEX',
      thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cb/Monkey_D_Luffy.png',
      categoryId: '1f8d3d65-5dc0-4cab-b440-f555dfd84b58',
      description: 'High-performance running shoes for all terrains.',
      isEnabled: true,
      isDeleted: false,
      likesCount: 0,
      minPrice: new Decimal(59.99),
      maxPrice: new Decimal(79.99),
      createdAt: new Date(),
      updatedAt: new Date(),
      productVariations: [
        {
          id: '0a8ccd15-31c1-4e18-95df-01837c5f37f8',
          productId: 'd7355e6e-4107-4545-afaf-6b152c0b2ae2',
          price: new Decimal(59.99),
          discount: new Decimal(10),
          discountType: 'FIXED',
          size: 'M',
          color: 'Black',
          stock: 100,
          stockRefilledAt: new Date(),
          isEnabled: true,
          isDeleted: false,
        },
        {
          id: '7e0aeda0-af2b-4b1f-a3ec-700cd652bb8f',
          productId: 'd7355e6e-4107-4545-afaf-6b152c0b2ae2',
          price: new Decimal(69.99),
          discount: new Decimal(5),
          discountType: 'PERCENTAGE',
          size: 'L',
          color: 'Blue',
          stock: 50,
          stockRefilledAt: new Date(),
          isEnabled: true,
          isDeleted: false,
        },
        {
          id: '426a5f2d-f850-44bf-a423-d8e956b93b07',
          productId: 'd7355e6e-4107-4545-afaf-6b152c0b2ae2',
          price: new Decimal(79.99),
          discount: new Decimal(0),
          discountType: 'NONE',
          size: 'XL',
          color: 'Red',
          stock: 30,
          stockRefilledAt: new Date(),
          isEnabled: true,
          isDeleted: false,
        },
      ],
    };

    const productWithVariation2: ProductWithVariations = {
      id: productId2,
      name: 'Sports Jacket',
      gender: 'MALE',
      thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cb/Monkey_D_Luffy.png',
      categoryId: 'e91d71ce-ce7d-4b8b-86d4-f1d4304626e3',
      description: 'Stylish and comfortable sports jacket.',
      isEnabled: true,
      isDeleted: false,
      likesCount: 0,
      minPrice: new Decimal(89.99),
      maxPrice: new Decimal(119.99),
      createdAt: new Date(),
      updatedAt: new Date(),
      productVariations: [
        {
          id: '124b41a4-a6f6-458b-9ce0-1753bbf75b2a',
          productId: '481e290b-c03a-40de-b949-48b13a89dced',
          price: new Decimal(145),
          discount: new Decimal(15),
          discountType: 'PERCENTAGE',
          size: 'S',
          color: 'Green',
          stock: 20,
          stockRefilledAt: new Date(),
          isEnabled: true,
          isDeleted: false,
        },
        {
          id: 'a71a9adc-b989-4e9c-a960-82aa7fd1f6c3',
          productId: '481e290b-c03a-40de-b949-48b13a89dced',
          price: new Decimal(99.99),
          discount: new Decimal(10),
          discountType: 'PERCENTAGE',
          size: 'M',
          color: 'Black',
          stock: 40,
          stockRefilledAt: new Date(),
          isEnabled: true,
          isDeleted: false,
        },
        {
          id: 'fb6152e1-ac33-45bd-85f2-9110e2c9da62',
          productId: '481e290b-c03a-40de-b949-48b13a89dced',
          price: new Decimal(119.99),
          discount: new Decimal(19.99),
          discountType: 'FIXED',
          size: 'L',
          color: 'Blue',
          stock: 15,
          stockRefilledAt: new Date(),
          isEnabled: true,
          isDeleted: false,
        },
      ],
    };
    const productWithVariation3: ProductWithVariations = {
      id: productId3,
      name: 'Intelligent Wooden Tuna',
      gender: 'MALE',
      thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cb/Monkey_D_Luffy.png',
      categoryId: 'aad62167-235d-4d1d-b4fd-f687b020acd0',
      description:
        'The sleek and prestigious Tuna comes with orchid LED lighting for smart functionality',
      isEnabled: true,
      isDeleted: false,
      likesCount: 0,
      minPrice: new Decimal(0),
      maxPrice: new Decimal(0),
      createdAt: new Date(),
      updatedAt: new Date(),
      productVariations: [],
    };

    beforeEach(() => {
      prismaService.product.update.mockReset();
      prismaService.product.findMany.mockReset();
      prismaService.$transaction.mockReset();
    });

    it('should recalculate min and max prices successfully', async () => {
      prismaService.product.findMany.mockResolvedValue([
        productWithVariation1,
        productWithVariation2,
        productWithVariation3,
      ]);

      const result = await service.recalculateProductMinMaxPrices([
        productId1,
        productId2,
        productId3,
      ]);

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: [productId1, productId2, productId3],
          },
        },
        include: { productVariations: true },
      });

      expect(prismaService.product.update).toHaveBeenCalledTimes(3);
      expect(prismaService.product.update).toHaveBeenNthCalledWith(1, {
        where: { id: productId1 },
        data: { minPrice: 59.99, maxPrice: 79.99 },
      });
      expect(prismaService.product.update).toHaveBeenNthCalledWith(2, {
        where: { id: productId2 },
        data: { minPrice: 99.99, maxPrice: 145 },
      });
      expect(prismaService.product.update).toHaveBeenNthCalledWith(3, {
        where: { id: productId3 },
        data: { minPrice: 0, maxPrice: 0 },
      });

      expect(result).toBeTruthy();
    });

    it('should handle products with no valid variations by setting prices to 0', async () => {
      const productsWithNoValidVariations = [
        {
          ...productWithVariation1,
          productVariations: [
            {
              ...productWithVariation1.productVariations[0],
              isEnabled: false,
              isDeleted: true,
            },
          ],
        },
      ];

      prismaService.product.findMany.mockResolvedValue(productsWithNoValidVariations);

      const result = await service.recalculateProductMinMaxPrices([productWithVariation1.id]);

      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id: productWithVariation1.id },
        data: { minPrice: 0, maxPrice: 0 },
      });

      expect(result).toBeTruthy();
    });

    it('should return false if an error occurs during transaction', async () => {
      prismaService.product.findMany.mockResolvedValue([productWithVariation1]);
      prismaService.$transaction.mockRejectedValue(new Error('Database error'));

      const result = await service.recalculateProductMinMaxPrices([productId1]);

      expect(result).toBeFalsy();
    });
  });

  describe('recalculateProductLikesCount', () => {
    const productId1 = validUUID1;
    const productId2 = validUUID2;

    const productsWithLikes: ProductWithLikes[] = [
      {
        ...validProduct1,
        id: productId1,
        productLikes: [
          { productId: productId1, userId: validUUID7, likedAt: new Date() },
          { productId: productId1, userId: validUUID8, likedAt: new Date() },
        ],
      },
      {
        ...validProduct2,
        id: productId2,
        productLikes: [],
      },
    ];

    beforeEach(() => {
      prismaService.product.update.mockReset();
    });

    it('should recalculate likes count successfully', async () => {
      prismaService.product.findMany.mockResolvedValue(productsWithLikes);
      prismaService.product.update.mockResolvedValueOnce({
        ...productsWithLikes[0],
        likesCount: 2,
      });
      prismaService.product.update.mockResolvedValueOnce({
        ...productsWithLikes[1],
        likesCount: 0,
      });

      await service.recalculateProductLikesCount([productId1, productId2]);

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: [productId1, productId2],
          },
        },
        include: { productLikes: true },
      });

      expect(prismaService.product.update).toHaveBeenCalledTimes(2);
      expect(prismaService.product.update).toHaveBeenNthCalledWith(1, {
        where: { id: productId1 },
        data: { likesCount: 2 },
      });
      expect(prismaService.product.update).toHaveBeenNthCalledWith(2, {
        where: { id: productId2 },
        data: { likesCount: 0 },
      });
    });

    it('should handle products with no likes', async () => {
      const productsWithNoLikes = [
        {
          ...validProduct1,
          id: productId2,
          isDeleted: false,
          isEnabled: true,
          productLikes: [],
        },
      ];

      prismaService.product.findMany.mockResolvedValue(productsWithNoLikes);
      prismaService.product.update.mockResolvedValue({
        ...productsWithNoLikes[0],
        likesCount: 0,
      });

      await service.recalculateProductLikesCount([productId2]);

      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id: productId2 },
        data: { likesCount: 0 },
      });
    });
  });

  describe('calculatePriceSummary', () => {
    it('should calculate price summary correctly for PERCENTAGE discount', () => {
      const input: PriceSummaryInput = {
        unitPrice: new Decimal(100),
        discountType: DiscountType.PERCENTAGE,
        discount: new Decimal(10), // 10%
        quantity: 2,
      };

      const expected: PriceSummary = {
        unitPrice: new Decimal(100),
        subTotal: new Decimal(200),
        discount: new Decimal(20), // 10% of 200
        total: new Decimal(180),
      };

      const result = service.calculatePriceSummary(input);

      expect(result).toEqual(expected);
    });

    it('should calculate price summary correctly for FIXED discount', () => {
      const input: PriceSummaryInput = {
        unitPrice: new Decimal(50),
        discountType: DiscountType.FIXED,
        discount: new Decimal(5), // $5 per unit
        quantity: 3,
      };

      const expected: PriceSummary = {
        unitPrice: new Decimal(50),
        subTotal: new Decimal(150),
        discount: new Decimal(15), // 5 * 3
        total: new Decimal(135),
      };

      const result = service.calculatePriceSummary(input);

      expect(result).toEqual(expected);
    });

    it('should verified discount neved exceeds subTotal', () => {
      const input: PriceSummaryInput = {
        unitPrice: new Decimal(30),
        discountType: DiscountType.FIXED,
        discount: new Decimal(40),
        quantity: 1,
      };

      const expected: PriceSummary = {
        unitPrice: new Decimal(30),
        subTotal: new Decimal(30),
        discount: new Decimal(30),
        total: new Decimal(0),
      };

      const result = service.calculatePriceSummary(input);

      expect(result).toEqual(expected);
    });

    it.each([[DiscountType.PERCENTAGE], [DiscountType.FIXED]])(
      'should handle zero discount',
      (discountType: DiscountType) => {
        const input: PriceSummaryInput = {
          unitPrice: new Decimal(80),
          discountType: discountType,
          discount: new Decimal(0),
          quantity: 1,
        };

        const expected: PriceSummary = {
          unitPrice: new Decimal(80),
          subTotal: new Decimal(80),
          discount: new Decimal(0),
          total: new Decimal(80),
        };

        const result = service.calculatePriceSummary(input);

        expect(result).toEqual(expected);
      },
    );

    it.each([[0], [-1]])('should handle invalid discount values: %d', (discount: number) => {
      const input: PriceSummaryInput = {
        unitPrice: new Decimal(80),
        discountType: DiscountType.PERCENTAGE,
        discount: new Decimal(discount),
        quantity: 1,
      };

      const expected: PriceSummary = {
        unitPrice: new Decimal(80),
        subTotal: new Decimal(80),
        discount: new Decimal(0),
        total: new Decimal(80),
      };

      const result = service.calculatePriceSummary(input);

      expect(result).toEqual(expected);
    });

    it.each([[255], [100], [110]])(
      'should handle invalid discount values: %d',
      (discount: number) => {
        const input: PriceSummaryInput = {
          unitPrice: new Decimal(200),
          discountType: DiscountType.PERCENTAGE,
          discount: new Decimal(discount),
          quantity: 1,
        };

        const expected: PriceSummary = {
          unitPrice: new Decimal(200),
          subTotal: new Decimal(200),
          discount: new Decimal(200),
          total: new Decimal(0),
        };

        const result = service.calculatePriceSummary(input);

        expect(result).toEqual(expected);
      },
    );
  });

  describe('createCartItemWithPriceSummary', () => {
    it('should create CartItemObject correctly', () => {
      const cartItem: CartItem = {
        userId: validUUID1,
        productVariationId: validProductVariation1.id,
        quantity: 2,
      };

      const productVariation: ProductVariation = {
        ...validProductVariation1,
        price: new Decimal(50),
        discount: new Decimal(10),
        discountType: DiscountType.PERCENTAGE,
      };

      const expectedCartItemObject = {
        userId: validUUID1,
        productVariationId: validProductVariation1.id,
        unitPrice: new Decimal(50),
        subTotal: new Decimal(100),
        discount: new Decimal(10),
        total: new Decimal(90),
        quantity: 2,
      };

      const result = service.createCartItemWithPriceSummary(cartItem, productVariation);

      expect(result).toEqual(expectedCartItemObject);
    });
  });
});
