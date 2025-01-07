import {
  ForbiddenException,
  Injectable,
  Logger,
  RawBodyRequest,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderStatusEnum, StripePaymentIntentEnum } from '@prisma/client';
import { StripeConfig, ConfigNames } from 'src/common/modules/config-env/config.interface';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<StripeConfig>(ConfigNames.stripeConfig).stripeKey,
      {
        apiVersion: '2024-12-18.acacia',
      },
    );
  }

  async createPaymentIntent(amount: number, orderId: string) {
    try {
      const paymentResponse = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        metadata: {
          orderId: orderId,
        },
        payment_method_types: ['card'],
      });
      this.logger.log('Payment intent created successfully', paymentResponse);
      return paymentResponse;
      // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new ServiceUnavailableException('Error creating payment intent on Stripe API');
    }
  }

  async handleWebhook(req: RawBodyRequest<Request>) {
    try {
      const signature = req.headers['stripe-signature'];
      const payload = req.rawBody;
      const event = await this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.configService.get<StripeConfig>(ConfigNames.stripeConfig).webhookSecret,
      );

      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await this.updatePaymentStatus(paymentIntent.id, paymentIntent.status);

      switch (event.type) {
        case 'payment_intent.succeeded':
          this.logger.log('Payment intent succeeded:', paymentIntent);
          await this.updateOrderStatus(
            paymentIntent.metadata.orderId,
            OrderStatusEnum.PAYMENT_APPROVED,
          );

          break;
        case 'payment_intent.payment_failed':
          this.logger.log('Payment intent failed:', paymentIntent);
          await this.updateOrderStatus(
            paymentIntent.metadata.orderId,
            OrderStatusEnum.RETRY_PAYMENT,
          );
          break;
        default:
          this.logger.warn('Unhandled event type:', event.type);
      }
    } catch (error) {
      this.logger.error('Error handling webhook', error);
      throw new ForbiddenException('Invalid webhook signature');
    }
  }

  private async updatePaymentStatus(
    paymentIntentId: string,
    webhookPaymentIntent: StripePaymentIntentEnum,
  ) {
    try {
      await this.prismaService.stripePayment.updateMany({
        where: {
          stripePaymentId: paymentIntentId,
        },
        data: {
          webhookPaymentIntent: webhookPaymentIntent,
        },
      });
    } catch (error) {
      this.logger.error('Error updating payment status', error);
    }
  }

  private async updateOrderStatus(orderId: string, status: OrderStatusEnum) {
    try {
      await this.prismaService.order.update({
        where: {
          id: orderId,
        },
        data: {
          status: status,
        },
      });
    } catch (error) {
      this.logger.error('Error updating order status', error);
    }
  }
}
