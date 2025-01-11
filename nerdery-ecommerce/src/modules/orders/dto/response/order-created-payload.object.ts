import { Field, ID, ObjectType } from '@nestjs/graphql';
import Decimal from 'decimal.js';
import { OrderItemObject } from 'src/modules/orders/entities/order-item.object';

import { OrderStatus } from '../order-status.enum';

@ObjectType()
export class OrderCreatedPayload {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  userId: string;

  @Field()
  currency: string;

  @Field()
  subTotal: Decimal;

  @Field()
  discount: Decimal;

  @Field()
  total: Decimal;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  isDeleted: boolean;

  @Field()
  isStockReserved: boolean;

  @Field(() => [OrderItemObject])
  orderItems: OrderItemObject[];

  @Field()
  clientSecret: string;

  @Field()
  paymentUrl: string;
}
