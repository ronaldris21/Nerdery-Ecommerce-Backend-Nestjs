import { Test, TestingModule } from '@nestjs/testing';
import { ProductVariation, User, Category, StripePayment, Product } from '@prisma/client';
import Decimal from 'decimal.js';
import {
  mockStripePayment,
  validProduct1,
  validProduct2,
  validProductVariation1,
  validUUID1,
  validUUID2,
  validVariationImages,
} from 'src/common/testing-mocks/helper-data';

import { PrismaService } from '../prisma/prisma.service';

import { DataloadersService } from './dataloaders.service';
import { UserByOrder } from './orders/user-by-order.loader/user-by-order.loader';
import { ProductByProductVariation } from './product-variation/product-by-product-variation.loader/product-by-product-variation.loader';
import { CategoryByProduct } from './products/category-by-product.loader/category-by-product.loader';

const mockPrismaService = {
  stripePayment: {
    findMany: jest.fn(),
  },
  user: {
    findMany: jest.fn(),
  },
  productVariation: {
    findMany: jest.fn(),
  },
  variationImage: {
    findMany: jest.fn(),
  },
  product: {
    findMany: jest.fn(),
  },
  category: {
    findMany: jest.fn(),
  },
};
describe('DataloadersService', () => {
  let service: DataloadersService;
  let prismaService: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataloadersService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<DataloadersService>(DataloadersService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listStripePaymentsByOrder', () => {
    const mockStripePayment1: StripePayment = {
      ...mockStripePayment,
      id: validUUID1,
      amount: new Decimal('100.00'),
    };

    const mockStripePayment2: StripePayment = {
      ...mockStripePayment,
      id: validUUID2,
      amount: new Decimal('100.00'),
    };

    it('should return stripe payments for given order IDs', async () => {
      const orderIds = [validUUID1, validUUID2];
      const mockPayments: StripePayment[] = [mockStripePayment1, mockStripePayment2];
      prismaService.stripePayment.findMany.mockResolvedValueOnce(mockPayments);

      const result = await service.listStripePaymentsByOrder(orderIds);

      expect(prismaService.stripePayment.findMany).toHaveBeenCalledWith({
        where: { orderId: { in: orderIds } },
      });
      expect(result).toEqual(mockPayments);
    });
  });

  describe('listUserByOrder', () => {
    it('should return users for given order IDs', async () => {
      const orderIds = [validUUID1];
      const mockUsers: User[] = [
        {
          id: validUUID1,
          email: 'user@example.com',
          firstName: 'Test',
          lastName: 'User',
          createdAt: new Date(),
          password: 'hashedPassword',
        },
      ];
      prismaService.user.findMany.mockResolvedValueOnce(mockUsers);

      const result: UserByOrder[] = await service.listUserByOrder(orderIds);

      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: { orders: { some: { id: { in: orderIds } } } },
        include: { orders: { select: { id: true } } },
      });
      expect(result).toEqual(mockUsers);
    });
  });

  describe('listProductVariationByOrderItem', () => {
    it('should return product variations for given order item IDs', async () => {
      const ids = ['var1', 'var2'];
      const mockVariations: ProductVariation[] = [validProductVariation1];
      prismaService.productVariation.findMany.mockResolvedValueOnce(mockVariations);

      const result = await service.listProductVariationByOrderItem(ids);

      expect(prismaService.productVariation.findMany).toHaveBeenCalledWith({
        where: { id: { in: ids } },
      });
      expect(result).toEqual(mockVariations);
    });
  });

  describe('listVariationImagesByProductVariation', () => {
    it('should return variation images for given product variation IDs', async () => {
      const ids = ['var1'];

      prismaService.variationImage.findMany.mockResolvedValueOnce(validVariationImages);

      const result = await service.listVariationImagesByProductVariation(ids);

      expect(prismaService.variationImage.findMany).toHaveBeenCalledWith({
        where: { productVariationId: { in: ids } },
      });
      expect(result).toEqual(validVariationImages);
    });
  });

  describe('listProductByProductVariation', () => {
    it('should return products for given product variation IDs', async () => {
      const variationIds = [validProduct1.id];
      const mockProducts: Product[] = [validProduct1];
      prismaService.product.findMany.mockResolvedValueOnce(mockProducts);

      const result: ProductByProductVariation[] =
        await service.listProductByProductVariation(variationIds);

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: { productVariations: { some: { id: { in: variationIds } } } },
        include: { productVariations: { select: { id: true } } },
      });
      expect(result).toEqual(mockProducts);
    });
  });

  describe('listCategoryByProduct', () => {
    it('should return categories for given product IDs', async () => {
      const productIds = ['prod1'];
      const mockCategories: Category[] = [
        { id: 'cat1', name: 'Category1', parentCategoryId: null },
      ];
      prismaService.category.findMany.mockResolvedValueOnce(mockCategories);

      const result: CategoryByProduct[] = await service.listCategoryByProduct(productIds);

      expect(prismaService.category.findMany).toHaveBeenCalledWith({
        where: { products: { some: { id: { in: productIds } } } },
        include: { products: { select: { id: true } } },
      });
      expect(result).toEqual(mockCategories);
    });
  });

  describe('listProductVariationByProduct', () => {
    it('should return product variations for given product IDs', async () => {
      const productIds = [validProductVariation1.id];
      const mockVariations: ProductVariation[] = [validProductVariation1];
      prismaService.productVariation.findMany.mockResolvedValueOnce(mockVariations);

      const result = await service.listProductVariationByProduct(productIds);

      expect(prismaService.productVariation.findMany).toHaveBeenCalledWith({
        where: { productId: { in: productIds } },
      });
      expect(result).toEqual(mockVariations);
    });
  });

  describe('listProductsByCategory', () => {
    it('should return products for given category IDs', async () => {
      const categoryIds = [validProduct1.categoryId, validProduct2.categoryId];
      const mockProducts: Product[] = [validProduct1, validProduct2];
      prismaService.product.findMany.mockResolvedValueOnce(mockProducts);

      const result = await service.listProductsByCategory(categoryIds);

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: { categoryId: { in: categoryIds } },
      });
      expect(result).toEqual(mockProducts);
    });
  });
});
