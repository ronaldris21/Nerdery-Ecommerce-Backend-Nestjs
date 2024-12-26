import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateProductVariationInput } from './dto/update-product-variation.input';
import { CreateProductVariationInput } from './dto/create-product-variation.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductHelperService } from 'src/common/services/product-calculations.service';
import { Prisma } from '@prisma/client';
import { fa } from '@faker-js/faker/.';

@Injectable()
export class ProductVariationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productsHelperService: ProductHelperService,
  ) { }

  async findAll(productId: string) {
    const where = { isDeleted: false, isEnabled: true };

    return await this.prisma.productVariation.findMany({
      where: { ...where, productId },
      include: { product: true, variationImages: true },
    });
  }

  async findOne(id: string) {
    const where = { isDeleted: false, isEnabled: true };
    return await this.findByIdAndValidate({ id, ...where });
  }

  async findByIdAndValidate(where: Prisma.ProductVariationWhereUniqueInput, includeProduct: boolean = true, variationImages: boolean = true) {
    const productVariation = await this.prisma.productVariation.findUnique({
      where,
      include: { product: includeProduct, variationImages: variationImages },
    });

    if (!productVariation) {
      throw new NotFoundException('Product-Variation not found');
    }

    return productVariation;
  }

  async create(input: CreateProductVariationInput) {

    await this.productsHelperService.findProductByIdAndValidate({ id: input.productId }, false, false);
    const { productId, ...rest } = input;

    const prodVariation = await this.prisma.productVariation.create({
      data: {
        ...rest,
        product: {
          connect: { id: input.productId },
        },
      },
    });

    await this.productsHelperService.recalculateProductMinMaxPrices([input.productId]);
    return await this.findByIdAndValidate({ id: prodVariation.id });
  }

  async update(input: UpdateProductVariationInput) {
    await this.productsHelperService.findProductByIdAndValidate({ id: input.id }, false, false);
    await this.findByIdAndValidate({ id: input.id }, false, false);

    const { productId, ...rest } = input;
    await this.prisma.productVariation.update({
      where: { id: input.id },
      data: {
        ...rest,
        product: {
          connect: { id: productId },
        },
      },
    });

    await this.productsHelperService.recalculateProductMinMaxPrices([input.productId]);
    return await this.findByIdAndValidate({ id: input.id }, false, false);
  }

  async toggleIsEnabled(id: string, isEnabled: boolean) {
    const prodVariation = await this.findByIdAndValidate({ id }, false, false);

    await this.prisma.productVariation.update({
      where: { id },
      data: { isEnabled },
    });

    await this.productsHelperService.recalculateProductMinMaxPrices([prodVariation.productId]);
    //TODO: remove from cart if exists and not enabled
    return await this.findByIdAndValidate({ id });
  }

  async delete(id: string) {
    const prodVariation = await this.findByIdAndValidate({ id }, false, false);

    await this.prisma.productVariation.update({
      where: { id },
      data: { isDeleted: true, isEnabled: false },
    });

    await this.productsHelperService.recalculateProductMinMaxPrices([prodVariation.productId]);
    //TODO: remove from cart if exists
    return await this.findByIdAndValidate({ id });
  }

}
