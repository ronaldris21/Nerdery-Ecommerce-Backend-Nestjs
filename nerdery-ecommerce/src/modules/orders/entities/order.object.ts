import { Field, ID, ObjectType } from '@nestjs/graphql';
import Decimal from 'decimal.js';

import { OrderStatus } from '../dto/order-status.enum';

import { ClientObject } from './client.object';
import { OrderItemObject } from './order-item.object';
import { StripePaymentObject } from './stripe-payment.object';

@ObjectType()
export class OrderObject {
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

  @Field(() => [StripePaymentObject])
  stripePayments?: StripePaymentObject[];

  @Field(() => ClientObject, { nullable: true })
  client?: ClientObject;
}
