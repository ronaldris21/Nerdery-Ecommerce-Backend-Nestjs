import { Injectable, Logger } from '@nestjs/common';
import { CartItem, ProductVariation } from '@prisma/client';
import Decimal from 'decimal.js';
import { PriceSummaryInput } from 'src/common/data/dto/price-summary-input.dto ';
import { PriceSummary } from 'src/common/data/dto/price-summary.dto';
import { DiscountType } from 'src/common/data/enums/discount-type.enum';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { ProductWithLikes, ProductWithVariations } from 'src/common/prisma-types';
import { CartItemObject } from 'src/modules/cart-items/entities/cart-item.object';

@Injectable()
export class ProductCalculatedFieldsService {
  logger = new Logger('ProductCalculatedFieldsService');
  constructor(private readonly prisma: PrismaService) {}

  async recalculateProductMinMaxPrices(productIds: string[]): Promise<boolean> {
    const products: ProductWithVariations[] = await this.prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      include: { productVariations: true },
    });

    const updatePromises = products.map((product) => {
      const filteredProductVariations = product.productVariations.filter(
        (p) => p.isEnabled && !p.isDeleted,
      );
      const prices = filteredProductVariations.map((p) => Number(p.price));

      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

      //If no valid product variations, prices are 0. So users can't add to cart, nor see the product on "products" query
      const calculatedData = { minPrice, maxPrice };
      if (minPrice) calculatedData['minPrice'] = minPrice;
      if (maxPrice) calculatedData['maxPrice'] = maxPrice;

      return this.prisma.product.update({
        where: { id: product.id },
        data: calculatedData,
      });
    });
    try {
      await this.prisma.$transaction(updatePromises);
      return true;
    } catch (error) {
      this.logger.error('Error updating product min-max prices', error);
      return false;
    }
  }

  async recalculateProductLikesCount(productIds: string[]): Promise<void> {
    const products: ProductWithLikes[] = await this.prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      include: { productLikes: true },
    });

    const updatePromises = products.map(async (product) => {
      const calculatedData = { likesCount: product.productLikes.length };
      await this.prisma.product.update({
        where: { id: product.id },
        data: calculatedData,
      });
    });
    await Promise.all(updatePromises);
  }

  calculatePriceSummary(input: PriceSummaryInput): PriceSummary {
    const { unitPrice, discount } = input;
    const { discountType, quantity } = input;

    const subTotal = unitPrice.times(quantity);

    let calculatedDiscount = new Decimal(0);
    if (discountType === DiscountType.PERCENTAGE) {
      // calculatedDiscount = (subTotal * discount) / 100;
      calculatedDiscount = subTotal.times(discount).dividedBy(100);
    } else if (discountType === DiscountType.FIXED) {
      // calculatedDiscount = discount * quantity;
      calculatedDiscount = discount.times(quantity);
    }

    if (calculatedDiscount > subTotal) {
      calculatedDiscount = subTotal;
    }

    if (calculatedDiscount.isNegative() || discount.isNegative()) {
      calculatedDiscount = new Decimal(0);
    }

    // round prices to 2 decimal places
    const result: PriceSummary = {
      // unitPrice: Number(unitPrice.toFixed(2)),
      // subTotal: Number(subTotal.toFixed(2)),
      // discount: Number(calculatedDiscount.toFixed(2)),
      // total: Number((subTotal - calculatedDiscount).toFixed(2)),
      unitPrice: unitPrice,
      subTotal: subTotal,
      discount: calculatedDiscount,
      total: subTotal.minus(calculatedDiscount),
    };

    if (result.total.lessThan(result.subTotal.minus(result.discount))) {
      result.discount = result.subTotal.minus(result.total);
    }

    return result;
  }

  createCartItemWithPriceSummary(
    cartItem: CartItem,
    prodVariation: ProductVariation,
  ): CartItemObject {
    const priceSummary = this.calculatePriceSummary({
      // discount: Number(prodVariation.discount.toFixed(2)),
      discount: prodVariation.discount,
      discountType: prodVariation.discountType,
      quantity: cartItem.quantity,
      // unitPrice: Number(prodVariation.price.toFixed(2)),
      unitPrice: prodVariation.price,
    });

    return {
      userId: cartItem.userId,
      quantity: cartItem.quantity,
      productVariationId: cartItem.productVariationId,

      //Calculated fields
      unitPrice: priceSummary.unitPrice,
      subTotal: priceSummary.subTotal,
      total: priceSummary.total,
      discount: priceSummary.discount,
    };
  }
}
