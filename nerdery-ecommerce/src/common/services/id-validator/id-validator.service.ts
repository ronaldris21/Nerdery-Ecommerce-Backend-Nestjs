import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';

@Injectable()
export class IdValidatorService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueProductById(
    where: Prisma.ProductWhereUniqueInput,
    includeCategory: boolean = true,
    includeVariations: boolean = true,
  ) {
    const product = await this.prisma.product.findUnique({
      where,
      include: {
        category: includeCategory,
        productVariations: includeVariations,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findUniqueProductVariationById(
    where: Prisma.ProductVariationWhereUniqueInput,
    includeProduct: boolean = true,
    variationImages: boolean = true,
  ) {
    try {
      const productVariation = await this.prisma.productVariation.findUnique({
        where,
        include: { product: includeProduct, variationImages: variationImages },
      });

      if (!productVariation) {
        throw new NotFoundException('Product-Variation not found');
      }
      return productVariation;
      // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new NotFoundException('Product-Variation not found');
    }
  }
}
