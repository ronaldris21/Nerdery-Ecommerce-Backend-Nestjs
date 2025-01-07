import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { MailService } from 'src/common/modules/mail/mail.service';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { CartItemObject } from 'src/modules/cart-items/entities/cart-item.object';

@Injectable()
export class StockReservationManagementService {
  logger = new Logger('StockReservationManagementService');

  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async reserveStock(cartitems: CartItemObject[]): Promise<void> {
    if (!cartitems || cartitems.length === 0) {
      throw new ConflictException('Error reserving stock - cart is empty');
    }

    const updateStockPrismaPromises = cartitems.map((item) =>
      this.prismaService.productVariation.update({
        where: {
          id: item.productVariationId,
        },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      }),
    );

    try {
      await this.prismaService.$transaction(updateStockPrismaPromises);
      // send email low stock email notification
      const productVariations = await this.prismaService.productVariation.findMany({
        where: {
          id: {
            in: cartitems.map((item) => item.productVariationId),
          },
          stock: {
            lte: 5,
            gt: 0,
          },
        },
      });

      for (const prodVariation of productVariations) {
        if (prodVariation.stock <= 5 && prodVariation.stock > 0) {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          this.mailService.sendLowStockEmailInitProcess(prodVariation);
        }
      }
    } catch (error) {
      this.logger.error('Error reserving stock', error);
      throw new ConflictException(
        'Error reserving stock - not enough stock in some products - please see you cart and try again',
      );
    }
  }
}
