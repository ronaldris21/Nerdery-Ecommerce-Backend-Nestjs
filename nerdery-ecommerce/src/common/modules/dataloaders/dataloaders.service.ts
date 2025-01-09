import { Injectable } from '@nestjs/common';
import { Product, ProductVariation, StripePayment, VariationImage } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { UserByOrder } from './orders/user-by-order.loader/user-by-order.loader';
import { ProductByProductVariation } from './product-variation/product-by-product-variation.loader/product-by-product-variation.loader';
import { CategoryByProduct } from './products/category-by-product.loader/category-by-product.loader';

@Injectable()
export class DataloadersService {
  constructor(private readonly prismaService: PrismaService) {}

  // ORDERS
  async listStripePaymentsByOrder(OrderIds: string[]): Promise<StripePayment[]> {
    const stripePayments = await this.prismaService.stripePayment.findMany({
      where: {
        orderId: {
          in: OrderIds,
        },
      },
    });
    return stripePayments;
  }

  async listUserByOrder(OrderIds: string[]): Promise<UserByOrder[]> {
    const users = await this.prismaService.user.findMany({
      where: {
        orders: {
          some: {
            id: {
              in: OrderIds,
            },
          },
        },
      },
      include: {
        orders: {
          select: { id: true },
        },
      },
    });

    return users;
  }

  //ORDER ITEMS
  async listProductVariationByOrderItem(
    orderProductVariationIds: string[],
  ): Promise<ProductVariation[]> {
    const productVariations = await this.prismaService.productVariation.findMany({
      where: {
        id: {
          in: orderProductVariationIds,
        },
      },
    });

    return productVariations;
  }

  // PRODUCT VARIATIONS
  async listVariationImagesByProductVariation(
    productVariationIds: string[],
  ): Promise<VariationImage[]> {
    const variationImages = await this.prismaService.variationImage.findMany({
      where: {
        productVariationId: {
          in: productVariationIds,
        },
      },
    });
    return variationImages;
  }

  async listProductByProductVariation(
    productVariationIds: string[],
  ): Promise<ProductByProductVariation[]> {
    const products = await this.prismaService.product.findMany({
      where: {
        productVariations: {
          some: {
            id: {
              in: productVariationIds,
            },
          },
        },
      },
      include: {
        productVariations: {
          select: { id: true },
        },
      },
    });
    return products;
  }

  // PRODUCTS
  async listCategoryByProduct(productIds: string[]): Promise<CategoryByProduct[]> {
    const categories = await this.prismaService.category.findMany({
      where: {
        products: {
          some: {
            id: {
              in: productIds,
            },
          },
        },
      },
      include: {
        products: {
          select: { id: true },
        },
      },
    });
    return categories;
  }

  async listProductVariationByProduct(productIds: string[]): Promise<ProductVariation[]> {
    const productVariations = await this.prismaService.productVariation.findMany({
      where: {
        productId: {
          in: productIds,
        },
      },
    });
    return productVariations;
  }

  // CATEGORIES
  async listProductsByCategory(categoryIds: string[]): Promise<Product[]> {
    const products = await this.prismaService.product.findMany({
      where: {
        categoryId: {
          in: categoryIds,
        },
      },
    });
    return products;
  }
}
