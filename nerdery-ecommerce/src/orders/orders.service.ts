import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatusEnum } from '@prisma/client';
import { CartService } from 'src/cart/cart.service';
import { ProductCalculatedFieldsService } from 'src/common/services/product-calculations/product-calculated-fields.service';
import { PrismaService } from 'src/prisma/prisma.service';

import { StockReservationManagementService } from './../common/services/stock-reservation-management/stock-reservation-management.service';
import { ApprovedStatusPayload } from './entities/approved-status.object';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productCalcFieldsService: ProductCalculatedFieldsService,
    private readonly cartService: CartService,
    private readonly StockReservationManagementService: StockReservationManagementService,
  ) {}

  async getPaymentApprovedStatus(orderId: string): Promise<ApprovedStatusPayload> {
    await this.ensureOrderExists(orderId);
    // Lógica para verificar si hay un stripePayment con status='APPROVED' (depende de tu modelo).
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
      },
    });

    const isApproved =
      order.status === OrderStatusEnum.PAYMENT_APPROVED ||
      order.status === OrderStatusEnum.COMPLETED;
    return {
      isApproved: isApproved,
      status: order.status,
    };
  }

  async createOrder(userId: string) {
    const cart = await this.cartService.myCart(userId);
    if (!cart.items.length) {
      throw new NotFoundException(
        'There are no items in the cart. Please add a product to your cart.',
      );
    }

    //Reservar stock!
    await this.StockReservationManagementService.reserveStock(cart.items);

    const order = await this.prisma.order.create({
      include: { orderItems: true },
      data: {
        userId: userId,
        status: OrderStatusEnum.WAITING_PAYMENT,
        total: cart.total,
        subTotal: cart.subTotal,
        discount: cart.discount,
        currency: 'usd',
        isDeleted: false,
        isStockReserved: true,
        orderItems: {
          createMany: {
            data: cart.items.map((cartItem) => ({
              productVariationId: cartItem.productVariationId,
              quantity: cartItem.quantity,
              unitPrice: cartItem.unitPrice,
              discount: cartItem.discount,
              subTotal: cartItem.subTotal,
              total: cartItem.total,
            })),
          },
        },
      },
    });

    await this.cartService.deleteAllItems(
      userId,
      cart.items.map((item) => item.productVariationId),
    );

    // // 4) Crear un StripePayment (mock) y retornamos su id
    // const stripePayment = await this.prisma.stripePayment.create({
    //   data: {
    //     orderId: order.id,
    //     amount: order.total,
    //     currency: 'USD',
    //     status: 'PENDING', // o lo que manejes en tu enum
    //   },
    // });

    // 5) Retornar
    return {
      ...order,
      // stripePaymentId: stripePayment.id,
    };
  }

  // ============== HELPER ==============
  private async ensureOrderExists(orderId: string) {
    const exists = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!exists) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
  }
}
