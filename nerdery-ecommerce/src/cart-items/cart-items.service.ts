import { Injectable } from '@nestjs/common';
import { IdValidatorService } from 'src/common/services/id-validator/id-validator.service';
import { PrismaService } from 'src/prisma/prisma.service';

import { CartItemInput } from './dto/cart-item.input';

@Injectable()
export class CartItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly idValidatorService: IdValidatorService,
  ) {}

  async create(input: CartItemInput, userId: string) {
    await this.idValidatorService.findUniqueProductVariationById({ id: input.productVariationId });

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
