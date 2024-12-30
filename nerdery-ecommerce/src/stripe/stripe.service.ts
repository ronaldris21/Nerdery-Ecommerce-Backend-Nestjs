import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StripeConfig, ConfigNames } from 'src/common/config/config.interface';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);
  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.get<StripeConfig>(ConfigNames.stripeConfig).stripeKey,
      {
        apiVersion: '2024-12-18.acacia',
      },
    );
  }

  async createPaymentIntent(amount: number, orderId: string) {
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
  }
}
