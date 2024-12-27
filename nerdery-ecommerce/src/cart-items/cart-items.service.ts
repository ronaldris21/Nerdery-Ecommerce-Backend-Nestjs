import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { GenericResponseDto } from 'src/common/dto/generic-response.dto';
import { IdValidatorService } from 'src/common/services/id-validator/id-validator.service';
import { ProductCalculatedFieldsService } from 'src/common/services/product-calculations/product-calculated-fields.service';
import { PrismaService } from 'src/prisma/prisma.service';

import { CartItemInput } from './dto/cart-item.input';

@Injectable()
export class CartItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly idValidatorService: IdValidatorService,
    private readonly productCalculatedFieldsService: ProductCalculatedFieldsService,
  ) {}

  async createOrUpdate(input: CartItemInput, userId: string) {
    const prodVariation = await this.idValidatorService.findUniqueProductVariationById({
      id: input.productVariationId,
    });

    if (input.quantity > prodVariation.stock) {
      throw new ConflictException(
        `Not enough stock available. There is only ${prodVariation.stock} pieces available`,
      );
    }

    const cartItem = await this.prisma.cartItem.upsert({
      where: {
        userId_productVariationId: {
          productVariationId: input.productVariationId,
          userId: userId,
        },
      },
      update: {
        quantity: input.quantity,
      },
      create: {
        userId: userId,
        quantity: input.quantity,
        productVariationId: input.productVariationId,
      },
      include: {
        productVariation: true,
      },
    });

    const priceSummary = this.productCalculatedFieldsService.calculatePriceSummary({
      discount: Number(cartItem.productVariation.discount),
      discountType: cartItem.productVariation.discountType,
      quantity: cartItem.quantity,
      unitPrice: Number(cartItem.productVariation.price),
    });

    return {
      ...cartItem,
      ...priceSummary,
    };
  }

  async delete(userId: string, productVariationId: string): Promise<GenericResponseDto> {
    try {
      await this.prisma.cartItem.delete({
        where: {
          userId_productVariationId: {
            productVariationId,
            userId,
          },
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new NotFoundException('Cart item not found.');
    }

    return {
      message: `Item remove from the cart`,
      statusCode: 204,
    };
  }
}
