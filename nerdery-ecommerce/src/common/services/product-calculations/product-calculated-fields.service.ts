import { Injectable } from '@nestjs/common';
import { CartItem, ProductVariation } from '@prisma/client';
import { CartItemObject } from 'src/cart-items/entities/cart-item.object';
import { PriceSummaryInput } from 'src/common/dto/price-summary-input.dto ';
import { PriceSummary } from 'src/common/dto/price-summary.dto';
import { DiscountType } from 'src/common/enums/discount-type.enum';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductCalculatedFieldsService {
  constructor(private readonly prisma: PrismaService) {}

  async recalculateProductMinMaxPrices(productIds: string[]) {
    const products = await this.prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        isDeleted: false,
        isEnabled: true,
      },
      include: { productVariations: true },
    });

    const updatePromises = products.map(async (product) => {
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

      await this.prisma.product.update({
        where: { id: product.id },
        data: calculatedData,
      });
    });

    await Promise.allSettled(updatePromises);
  }

  async recalculateProductLikesCount(productIds: string[]) {
    const products = await this.prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        isDeleted: false,
        isEnabled: true,
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
    const { unitPrice, discountType, discount, quantity } = input;

    const subTotal = unitPrice * quantity;

    let calculatedDiscount = 0;
    if (discountType === DiscountType.PERCENTAGE) {
      calculatedDiscount = (subTotal * discount) / 100;
    } else if (discountType === DiscountType.FIXED) {
      calculatedDiscount = discount * quantity;
    }

    if (calculatedDiscount > subTotal) {
      calculatedDiscount = subTotal;
    }

    // round prices to 2 decimal places
    const result: PriceSummary = {
      unitPrice: Math.round(unitPrice * 100) / 100,
      subTotal: Math.round(subTotal * 100) / 100,
      discount: Math.round(calculatedDiscount * 100) / 100,
      total: Math.round((subTotal - calculatedDiscount) * 100) / 100,
    };
    return result;
  }

  createCartItemObjectFromProductVariation(
    cartItem: CartItem,
    prodVariation: ProductVariation,
  ): CartItemObject {
    const priceSummary = this.calculatePriceSummary({
      discount: Number(prodVariation.discount),
      discountType: prodVariation.discountType,
      quantity: cartItem.quantity,
      unitPrice: Number(prodVariation.price),
    });

    return {
      userId: cartItem.userId,
      unitPrice: priceSummary.unitPrice,
      subTotal: priceSummary.subTotal,
      total: priceSummary.total,
      discount: priceSummary.discount,
      quantity: cartItem.quantity,
      productVariationId: cartItem.productVariationId,
    };
  }
}
