import { ObjectType, Field } from '@nestjs/graphql';

import { OrderStatus } from '../order-status.enum';

@ObjectType()
export class ApprovedStatusPayload {
  @Field()
  isApproved: boolean;

  @Field(() => OrderStatus)
  status: OrderStatus;
}
