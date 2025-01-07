import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderStatusEnum, StripePaymentIntentEnum } from '@prisma/client';
import { ConfigNames, FrontendConfig } from 'src/common/modules/config-env/config.interface';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { StripeService } from 'src/modules/stripe/stripe.service';

import { StockReservationManagementService } from '../../common/services/stock-reservation-management/stock-reservation-management.service';
import { CartService } from '../cart/cart.service';

import { ApprovedStatusPayload } from './entities/approved-status.object';
import { RetryPaymentPayload } from './entities/retry-payment.object';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
    private readonly StockReservationManagementService: StockReservationManagementService,
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
  ) {}

  async getPaymentApprovedStatus(orderId: string): Promise<ApprovedStatusPayload> {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

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

    const stripeResult = await this.stripeService.createPaymentIntent(
      Number(order.total),
      order.id,
    );

    await this.prisma.stripePayment.create({
      data: {
        orderId: order.id,
        amount: order.total,
        currency: 'usd',
        webhookPaymentIntent: stripeResult.status as StripePaymentIntentEnum,
        stripePaymentId: stripeResult.id,
        webhookData: null,
        clientSecret: stripeResult.client_secret,
      },
    });

    await this.cartService.deleteAllItems(
      userId,
      cart.items.map((item) => item.productVariationId),
    );

    const paymentUrl =
      this.configService.get<FrontendConfig>(ConfigNames.frontend).paymentClientSecretFrontendUrl +
      stripeResult.client_secret;

    return {
      ...order,
      clientSecret: stripeResult.client_secret,
      paymentUrl: paymentUrl,
    };
  }

  async getOrders(userId: string, isAdmin: boolean = false) {
    return await this.prisma.order.findMany({
      where: {
        userId: userId,
      },
      include: {
        user: isAdmin,
        orderIncidents: isAdmin,
        orderItems: {
          include: {
            productVariation: {
              include: {
                product: true,
                variationImages: true,
              },
            },
          },
        },
        stripePayments: true,
      },
    });
  }

  async retryPayment(orderId: string): Promise<RetryPaymentPayload> {
    const approvedStatus = await this.getPaymentApprovedStatus(orderId);

    if (approvedStatus.isApproved) {
      return {
        isPaymentNeeded: false,
      };
    }

    const payment = await this.prisma.stripePayment.findFirst({
      where: {
        orderId: orderId,
      },
    });

    const paymentUrl =
      this.configService.get<FrontendConfig>(ConfigNames.frontend).paymentClientSecretFrontendUrl +
      payment.clientSecret;

    return {
      isPaymentNeeded: true,
      paymentUrl: paymentUrl,
      clientSecret: payment.clientSecret,
    };
  }
}
