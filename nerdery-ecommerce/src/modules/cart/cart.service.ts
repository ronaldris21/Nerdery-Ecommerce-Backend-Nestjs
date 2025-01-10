import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { ProductCalculatedFieldsService } from 'src/common/services/product-calculations/product-calculated-fields.service';

import { CartObject } from './entities/cart.entity';

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productCalculatedFieldsService: ProductCalculatedFieldsService,
  ) {}

  async myCart(userId: string): Promise<CartObject> {
    let cartItems = await this.prisma.cartItem.findMany({
      where: {
        userId,
      },
      include: {
        productVariation: true,
      },
    });

    cartItems = cartItems.filter(
      (item) =>
        !item.productVariation.isDeleted &&
        item.productVariation.isEnabled &&
        item.productVariation.stock > 0 &&
        item.quantity > 0 &&
        item.quantity <= item.productVariation.stock,
    );

    let result: CartObject = {
      items: [],
      discount: new Decimal(0),
      subTotal: new Decimal(0),
      total: new Decimal(0),
    };

    result = cartItems.reduce((resultAcc, cartItem) => {
      const tempResult = this.productCalculatedFieldsService.createCartItemWithPriceSummary(
        cartItem,
        cartItem.productVariation,
      );
      // tempResult.productVariation = plainToInstance(ProductVariationDto, cartItem.productVariation);
      tempResult.productVariation = cartItem.productVariation;

      resultAcc.items.push(tempResult);
      resultAcc.discount = resultAcc.discount.add(tempResult.discount);
      resultAcc.subTotal = resultAcc.subTotal.add(tempResult.subTotal);
      resultAcc.total = resultAcc.total.add(tempResult.total);

      return resultAcc;
    }, result);

    return result;
    // return {
    //   ...result,
    //   discount: Number(result.discount.toFixed(2)),
    //   subTotal: Number(result.subTotal.toFixed(2)),
    //   total: Number(result.total.toFixed(2)),
    // };
  }

  async deleteAllItems(userId: string, productVariationIds: string[]): Promise<number> {
    const result = await this.prisma.cartItem.deleteMany({
      where: {
        userId,
        productVariationId: {
          in: productVariationIds,
        },
      },
    });

    return result.count;
  }
}
