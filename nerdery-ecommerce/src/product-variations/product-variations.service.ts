import { Injectable } from '@nestjs/common';
import { UpdateProductVariationInput } from './dto/update-product-variation.input';
import { CreateProductVariationInput } from './dto/create-product-variation.input';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductVariationsService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(productId: string) {
    const where = { isDeleted: false, isEnabled: true };

    return await this.prisma.productVariation.findMany({
      where: { ...where, productId },
      include: { product: true, variationImages: true },
    });
  }

  async findOne(id: string) {
    const where = { isDeleted: false, isEnabled: true };
    return await this.prisma.productVariation.findUnique({
      where: { ...where, id },
      include: { product: true, variationImages: true },
    });
  }

}
