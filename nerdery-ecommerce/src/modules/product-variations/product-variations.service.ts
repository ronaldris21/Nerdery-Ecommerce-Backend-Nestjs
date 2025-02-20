import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { DiscountType } from 'src/common/data/enums/discount-type.enum';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { IdValidatorService } from 'src/common/services/id-validator/id-validator.service';
import { ProductCalculatedFieldsService } from 'src/common/services/product-calculations/product-calculated-fields.service';

import { CreateProductVariationInput } from './dto/request/create-product-variation.input';
import { UpdateProductVariationInput } from './dto/request/update-product-variation.input';
import { ProductVariationObject } from './entities/product-variation.entity';

@Injectable()
export class ProductVariationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productCalculatedFieldsService: ProductCalculatedFieldsService,
    private readonly idValidatorService: IdValidatorService,
  ) {}

  async findAll(productId: string): Promise<ProductVariationObject[]> {
    const where = { isDeleted: false, isEnabled: true };

    const productVariations = await this.prisma.productVariation.findMany({
      where: { ...where, productId },
    });
    return productVariations;
  }

  async findOne(id: string): Promise<ProductVariationObject> {
    const where = { isDeleted: false, isEnabled: true };
    const prodVariation = await this.idValidatorService.findUniqueProductVariationById({
      id,
      ...where,
    });
    return prodVariation;
  }

  async create(input: CreateProductVariationInput): Promise<ProductVariationObject> {
    await this.idValidatorService.findUniqueProductById({ id: input.productId });
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
    return prodVariation;
  }

  async update(input: UpdateProductVariationInput): Promise<ProductVariationObject> {
    const prodVariation = await this.idValidatorService.findUniqueProductVariationById({
      id: input.id,
    });

    if (input.productId) {
      await this.idValidatorService.findUniqueProductById({ id: input.productId });
    }

    this.validateDiscount({
      price: input.price ?? Number(prodVariation.price),
      type: input.discountType ?? prodVariation.discountType,
      discount: input.discount ?? Number(prodVariation.discount),
    });

    const { productId, ...rest } = input;

    if (input.price) {
      rest.price = Math.round(input.price * 100) / 100;
    }

    const productVariationUpdated = await this.prisma.productVariation.update({
      where: { id: input.id },
      data: {
        ...rest,
        product: {
          connect: { id: productId ?? prodVariation.productId },
        },
      },
    });

    await this.productCalculatedFieldsService.recalculateProductMinMaxPrices([
      productVariationUpdated.productId,
    ]);
    return productVariationUpdated;
  }

  async toggleIsEnabled(id: string, isEnabled: boolean): Promise<ProductVariationObject> {
    const prodVariation = await this.idValidatorService.findUniqueProductVariationById({ id });

    const productVariationDeleted = await this.prisma.productVariation.update({
      where: { id },
      data: { isEnabled },
    });

    await this.productCalculatedFieldsService.recalculateProductMinMaxPrices([
      prodVariation.productId,
    ]);
    return productVariationDeleted;
  }

  //TODO TEST: 1 query less
  async delete(id: string): Promise<ProductVariationObject> {
    const prodVariation = await this.idValidatorService.findUniqueProductVariationById({ id });

    const productVariationUpdated = await this.prisma.productVariation.update({
      where: { id },
      data: { isDeleted: true, isEnabled: false },
    });

    await this.productCalculatedFieldsService.recalculateProductMinMaxPrices([
      prodVariation.productId,
    ]);
    return productVariationUpdated;
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
