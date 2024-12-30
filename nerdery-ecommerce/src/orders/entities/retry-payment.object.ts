import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class RetryPaymentPayload {
  @Field()
  isPaymentNeeded: boolean;

  @Field(() => String, { nullable: true })
  clientSecret?: string;

  @Field(() => String, { nullable: true })
  paymentUrl?: string;
}
