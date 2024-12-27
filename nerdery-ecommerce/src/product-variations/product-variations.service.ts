import { Injectable } from '@nestjs/common';
import { IdValidatorService } from 'src/common/services/id-validator/id-validator.service';
import { ProductCalculatedFieldsService } from 'src/common/services/product-calculations/product-calculated-fields.service';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateProductVariationInput } from './dto/create-product-variation.input';
import { UpdateProductVariationInput } from './dto/update-product-variation.input';

@Injectable()
export class ProductVariationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productCalculatedFieldsService: ProductCalculatedFieldsService,
    private readonly idValidatorService: IdValidatorService,
  ) {}

  async findAll(productId: string) {
    const where = { isDeleted: false, isEnabled: true };

    return await this.prisma.productVariation.findMany({
      where: { ...where, productId },
      include: { product: true, variationImages: true },
    });
  }

  async findOne(id: string) {
    const where = { isDeleted: false, isEnabled: true };
    return await this.idValidatorService.findUniqueProductVariationById({ id, ...where });
  }

  async create(input: CreateProductVariationInput) {
    await this.idValidatorService.findUniqueProductById({ id: input.productId }, false, false);
    const { productId, ...rest } = input;

    const prodVariation = await this.prisma.productVariation.create({
      data: {
        ...rest,
        product: {
          connect: { id: productId },
        },
      },
    });

    await this.productCalculatedFieldsService.recalculateProductMinMaxPrices([productId]);
    return await this.idValidatorService.findUniqueProductVariationById({
      id: prodVariation.id,
    });
  }

  async update(input: UpdateProductVariationInput) {
    await this.idValidatorService.findUniqueProductById({ id: input.productId }, false, false);
    await this.idValidatorService.findUniqueProductVariationById({ id: input.id }, false, false);

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

    await this.productCalculatedFieldsService.recalculateProductMinMaxPrices([input.productId]);
    return await this.idValidatorService.findUniqueProductVariationById({ id: input.id });
  }

  async toggleIsEnabled(id: string, isEnabled: boolean) {
    const prodVariation = await this.idValidatorService.findUniqueProductVariationById(
      { id },
      false,
      false,
    );

    await this.prisma.productVariation.update({
      where: { id },
      data: { isEnabled },
    });

    await this.productCalculatedFieldsService.recalculateProductMinMaxPrices([
      prodVariation.productId,
    ]);
    //TODO: remove from cart if exists and not enabled
    return await this.idValidatorService.findUniqueProductVariationById({ id });
  }

  async delete(id: string) {
    const prodVariation = await this.idValidatorService.findUniqueProductVariationById(
      { id },
      false,
      false,
    );

    await this.prisma.productVariation.update({
      where: { id },
      data: { isDeleted: true, isEnabled: false },
    });

    await this.productCalculatedFieldsService.recalculateProductMinMaxPrices([
      prodVariation.productId,
    ]);
    //TODO: remove from cart if exists
    return await this.idValidatorService.findUniqueProductVariationById({ id });
  }
}
