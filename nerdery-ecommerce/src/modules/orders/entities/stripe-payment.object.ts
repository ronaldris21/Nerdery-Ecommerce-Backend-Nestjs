import { ObjectType, Field, ID } from '@nestjs/graphql';
import Decimal from 'decimal.js';

import { StripePaymentIntent } from '../dto/webhook-payment-intent.enum';

@ObjectType()
export class StripePaymentObject {
  @Field(() => ID)
  id: string;

  @Field()
  orderId: string;

  @Field()
  amount: Decimal;

  @Field()
  currency: string;

  @Field()
  stripePaymentId: string;

  @Field()
  clientSecret: string;

  @Field(() => StripePaymentIntent)
  webhookPaymentIntent: StripePaymentIntent;

  @Field(() => String, { nullable: true })
  webhookData: any;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
