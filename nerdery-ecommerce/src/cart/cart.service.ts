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
    const cartItems = await this.prisma.cartItem.findMany({
      where: {
        userId,
      },
      include: {
        productVariation: true,
      },
    });

    const result: CartObject = {
      items: [],
      discount: 0,
      subTotal: 0,
      total: 0,
    };

    return cartItems.reduce((resultAcc, cartItem) => {
      const tempResult =
        this.productCalculatedFieldsService.createCartItemObjectFromProductVariation(
          cartItem,
          cartItem.productVariation,
        );

      resultAcc.items.push(tempResult);
      resultAcc.discount += tempResult.discount;
      resultAcc.subTotal += tempResult.subTotal;
      resultAcc.total += tempResult.total;

      return resultAcc;
    }, result);
  }
}
