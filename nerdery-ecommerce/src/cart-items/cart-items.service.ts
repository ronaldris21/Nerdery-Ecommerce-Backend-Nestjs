import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { CartItemInput } from './dto/cart-item.input';

@Injectable()
export class CartItemsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(input: CartItemInput, userId: string) {
    return await this.prisma.cartItem.create({
      data: {
        userId: userId,
        quantity: input.quantity,
        productVariationId: input.productVariationId,
      },
      include: {
        productVariation: true,
      },
    });
  }

  // update(input: CartItemInput) {
  //   throw new InternalServerErrorException('Not implemented');
  // }

  // remove(userId: string, productVariationId: string) {
  //   throw new InternalServerErrorException('Not implemented');
  // }
}
