import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Product, ProductVariation } from '@prisma/client';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';

@Injectable()
export class IdValidatorService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueProductById(where: Prisma.ProductWhereUniqueInput): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findUniqueProductVariationById(
    where: Prisma.ProductVariationWhereUniqueInput,
  ): Promise<ProductVariation> {
    try {
      const productVariation = await this.prisma.productVariation.findUnique({
        where,
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
