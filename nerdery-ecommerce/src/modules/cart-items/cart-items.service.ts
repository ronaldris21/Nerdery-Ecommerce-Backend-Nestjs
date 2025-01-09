import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { GenericResponseDto } from 'src/common/data/dto/generic-response.dto';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { IdValidatorService } from 'src/common/services/id-validator/id-validator.service';
import { ProductCalculatedFieldsService } from 'src/common/services/product-calculations/product-calculated-fields.service';

import { CartItemInput } from './dto/cart-item.input';

@Injectable()
export class CartItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly idValidatorService: IdValidatorService,
    private readonly productCalculatedFieldsService: ProductCalculatedFieldsService,
  ) {}

  async createOrUpdate(input: CartItemInput, userId: string) {
    //TODO: test TryCatch
    const prodVariation = await this.prisma.productVariation.findUnique({
      where: {
        id: input.productVariationId,
      },
      include: {
        product: true,
      },
    });

    if (
      !prodVariation.isEnabled ||
      !prodVariation.product.isEnabled ||
      prodVariation.isDeleted ||
      prodVariation.product.isDeleted
    ) {
      throw new ConflictException(`Conflict, product is either deleted or not enabled`);
    }

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
    });

    return this.productCalculatedFieldsService.createCartItemWithPriceSummary(
      cartItem,
      prodVariation,
    );
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
