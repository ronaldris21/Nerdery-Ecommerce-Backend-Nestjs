import { Injectable } from '@nestjs/common';
import { ProductCalculatedFieldsService } from 'src/common/services/product-calculations/product-calculated-fields.service';
import { PrismaService } from 'src/prisma/prisma.service';

import { CartObject } from './entities/cart.entity';

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productCalculatedFieldsService: ProductCalculatedFieldsService,
  ) {}

  async myCart(userId: string) {
    let cartItems = await this.prisma.cartItem.findMany({
      where: {
        userId,
      },
      include: {
        productVariation: {
          include: {
            product: true,
            variationImages: true,
          },
        },
      },
    });

    // console.log('\n\n cartItems');
    // console.log(cartItems);

    cartItems = cartItems.filter(
      (item) =>
        !item.productVariation.isDeleted &&
        item.productVariation.isEnabled &&
        item.productVariation.stock > 0 &&
        item.quantity > 0 &&
        item.quantity <= item.productVariation.stock,
    );
    // console.log('\n\n cartItems.filter');
    // console.log(JSON.stringify(cartItems));

    let result: CartObject = {
      items: [],
      discount: 0,
      subTotal: 0,
      total: 0,
    };

    result = cartItems.reduce((resultAcc, cartItem) => {
      const tempResult = this.productCalculatedFieldsService.createCartItemWithPriceSummary(
        cartItem,
        cartItem.productVariation,
      );
      tempResult.productVariation = cartItem.productVariation as any;

      resultAcc.items.push(tempResult);
      resultAcc.discount += tempResult.discount;
      resultAcc.subTotal += tempResult.subTotal;
      resultAcc.total += tempResult.total;

      return resultAcc;
    }, result);

    return {
      ...result,
      discount: Number(result.discount.toFixed(2)),
      subTotal: Number(result.subTotal.toFixed(2)),
      total: Number(result.total.toFixed(2)),
    };
  }

  async deleteAllItems(userId: string, productVariationIds: string[]) {
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
