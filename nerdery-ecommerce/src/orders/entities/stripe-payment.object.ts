import { ObjectType, Field, ID } from '@nestjs/graphql';

import { StripePaymentIntent } from '../dto/webhook-payment-intent.enum';

@ObjectType()
export class StripePaymentObject {
  @Field(() => ID)
  id: string;

  @Field()
  orderId: string;

  @Field(() => Number)
  amount: number;

  @Field()
  currency: string;

  @Field()
  stripePaymentId: string;

  @Field(() => StripePaymentIntent)
  webhookPaymentIntent: StripePaymentIntent;

  @Field(() => String)
  webhookData: any;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
