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

    cartItems = cartItems.filter(
      (item) =>
        !item.productVariation.isDeleted &&
        item.productVariation.isEnabled &&
        item.productVariation.stock > 0 &&
        item.quantity > 0 &&
        item.quantity <= item.productVariation.stock,
    );

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
      tempResult.productVariation = cartItem.productVariation as any;

      resultAcc.items.push(tempResult);
      resultAcc.discount += tempResult.discount;
      resultAcc.subTotal += tempResult.subTotal;
      resultAcc.total += tempResult.total;

      return resultAcc;
    }, result);
  }

  async deleteAllItems(userId: string, productVariationIds: string[]) {
    await this.prisma.cartItem.deleteMany({
      where: {
        userId,
        productVariationId: {
          in: productVariationIds,
        },
      },
    });
  }
}
