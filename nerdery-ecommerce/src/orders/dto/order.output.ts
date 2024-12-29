// order.output.ts
import { ObjectType, Field } from '@nestjs/graphql';

import { ClientOrderObject } from '../entities/client-order.object';

@ObjectType()
export class CreateOrderPayload {
  @Field(() => ClientOrderObject)
  order: ClientOrderObject;

  @Field()
  stripePaymentId: string;
}
