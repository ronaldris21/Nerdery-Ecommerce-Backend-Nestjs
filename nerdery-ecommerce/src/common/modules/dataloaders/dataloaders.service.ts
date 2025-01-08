import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DataloadersService {
  constructor(private readonly prismaService: PrismaService) {}

  // ORDERS
  async listStripePaymentsByOrder(OrderIds: string[]) {
    const stripePayments = await this.prismaService.stripePayment.findMany({
      where: {
        orderId: {
          in: OrderIds,
        },
      },
      include: {
        order: {
          select: { id: true },
        },
      },
    });
    return stripePayments;
  }

  async listUserByOrder(OrderIds: string[]) {
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
  async listProductVariationByOrderItem(orderItemsId: string[]) {
    const productVariations = await this.prismaService.productVariation.findMany({
      where: {
        orderItems: {
          some: {
            id: {
              in: orderItemsId,
            },
          },
        },
      },
      include: {
        orderItems: {
          select: { id: true },
        },
      },
    });

    return productVariations;
  }

  // PRODUCT VARIATIONS
  async listVariationImagesByProductVariation(productVariationIds: string[]) {
    const variationImages = await this.prismaService.variationImage.findMany({
      where: {
        productVariationId: {
          in: productVariationIds,
        },
      },
    });
    return variationImages;
  }

  async listProductByProductVariation(productVariationIds: string[]) {
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
  async listCategoryByProduct(productIds: string[]) {
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

  async listProductVariationByProduct(productIds: string[]) {
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
  async listProductsByCategory(categoryIds: string[]) {
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
