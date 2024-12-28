import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { DiscountType } from 'src/common/enums/discount-type.enum';
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
    return await this.idValidatorService.findUniqueProductVariationById({
      id,
      ...where,
    });
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
    const prodVariation = await this.idValidatorService.findUniqueProductVariationById(
      { id: input.id },
      false,
      false,
    );

    this.validateDiscount({
      price: input.price ?? Number(prodVariation.price),
      type: input.discountType ?? prodVariation.discountType,
      discount: input.discount ?? Number(prodVariation.discount),
    });

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
    return await this.idValidatorService.findUniqueProductVariationById({
      id: input.id,
    });
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
    return await this.idValidatorService.findUniqueProductVariationById({ id });
  }

  validateDiscount({
    type,
    price,
    discount,
  }: {
    type: DiscountType;
    price: number;
    discount?: number;
  }): boolean {
    if (!discount) return true;

    if (type && type != DiscountType.NONE && !discount) {
      throw new UnprocessableEntityException('Need a valid discount value');
    }

    if (type === DiscountType.PERCENTAGE) {
      if (discount > 99 || discount < 0) {
        throw new UnprocessableEntityException(
          'PERCENTAGE discount needs a valid discount between 0-100',
        );
      }
    }

    if (type === DiscountType.FIXED) {
      if (!price) {
        throw new UnprocessableEntityException(`FIXED discount needs a price`);
      }
      if (discount >= price || discount < 0) {
        throw new UnprocessableEntityException(
          `FIXED discount needs a valid discount between 0 - ${price}`,
        );
      }
    }

    return true;
  }
}
