import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

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

  @Field(() => Float)
  subTotal: number;

  @Field(() => Float)
  discount: number;

  @Field(() => Float)
  total: number;

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
  stripePayments: StripePaymentObject[];

  //Accessible only for admins
  @Field(() => ClientObject, { nullable: true })
  client?: ClientObject;
}
