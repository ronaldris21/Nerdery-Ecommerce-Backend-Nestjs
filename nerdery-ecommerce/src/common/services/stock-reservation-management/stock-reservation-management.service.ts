import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CartItemObject } from 'src/cart-items/entities/cart-item.object';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StockReservationManagementService {
  logger = new Logger('StockReservationManagementService');

  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async reserveStock(cartitems: CartItemObject[]): Promise<void> {
    //THIS FUNCTION ASSUMES THE STOCK WAS VALIDATED AND THERE IS ENOUGH STOCK BEFORE RESERVING IT

    //Refractor to use prisma transaction - restore stock if something goes wrong

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
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.mailService.sendLowStockEmailInitProcess(prodVariation);
      }
    } catch (error) {
      this.logger.error('Error reserving stock', error);
      throw new ConflictException('Error reserving stock - please see you cart and try again');
    }
  }
}
