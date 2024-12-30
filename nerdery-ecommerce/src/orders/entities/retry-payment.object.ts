import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class RetryPaymentPayload {
  @Field()
  isPaymentNeeded: boolean;

  @Field()
  clientSecret?: string;

  @Field()
  paymentUrl?: string;
}
