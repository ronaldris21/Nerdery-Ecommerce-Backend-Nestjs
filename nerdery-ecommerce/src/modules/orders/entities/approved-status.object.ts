import { ObjectType, Field } from '@nestjs/graphql';

import { OrderStatus } from '../dto/order-status.enum';

@ObjectType()
export class ApprovedStatusPayload {
  @Field()
  isApproved: boolean;

  @Field(() => OrderStatus)
  status: OrderStatus;
}
