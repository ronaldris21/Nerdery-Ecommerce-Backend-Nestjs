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
    const { productId, price, ...rest } = input;

    this.validateDiscount({
      price,
      type: input.discountType,
      discount: input.discount,
    });
    const prodVariation = await this.prisma.productVariation.create({
      data: {
        ...rest,
        price: Math.round(price * 100) / 100,
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

    if (input.price) {
      rest.price = Math.round(input.price * 100) / 100;
    }

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
    if (price <= 0) {
      throw new UnprocessableEntityException('Price must be a positive number');
    }
    if (type === DiscountType.NONE) {
      return true;
    }

    if (discount === undefined || discount <= 0) {
      throw new UnprocessableEntityException(
        'Discount must be provided for non-NONE discount types. Discount must be a positive number',
      );
    }

    if (type === DiscountType.PERCENTAGE && discount > 100) {
      throw new UnprocessableEntityException('Percentage discount must be between 0 and 100');
    }

    if (type === DiscountType.FIXED && discount >= price) {
      throw new UnprocessableEntityException('Fixed discount must be a positive number');
    }

    return true;
  }
}
