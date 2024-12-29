import { Injectable } from '@nestjs/common';
import { CartItemObject } from 'src/cart-items/entities/cart-item.object';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StockReservationManagementService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async reserveStock(cartitems: CartItemObject[]): Promise<void> {
    //THIS FUNCTION REQUIRES TO VALIDATE THE STOCK BEFORE RESERVING IT

    const stockPromises = cartitems.map(
      async (item) =>
        new Promise(async (resolve) => {
          const productVariation = await this.prismaService.productVariation.update({
            where: {
              id: item.productVariationId,
            },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });

          //TODO: send email low stock email notification
          if (productVariation.stock < 3 && productVariation.stock > 0) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.mailService.sendLowStockEmail(productVariation);
          }

          resolve(1);
        }),
    );

    await Promise.all(stockPromises);
  }
}
