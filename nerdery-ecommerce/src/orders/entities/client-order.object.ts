import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

import { OrderStatus } from '../dto/order-status.enum';

import { OrderItemObject } from './order-item.object';

@ObjectType()
export class ClientOrderObject {
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

  @Field()
  clientSecret: string;

  @Field()
  paymentUrl: string;

  // @Field(() => [StripePayment])
  // payments: StripePayment[];
}
