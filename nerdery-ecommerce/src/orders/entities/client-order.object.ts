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
  createdAt: Date; // Usa tu scalar DateTime si lo tienes configurado

  @Field()
  updatedAt: Date; // O tu scalar DateTime

  @Field()
  isDeleted: boolean;

  @Field()
  isStockReserved: boolean;

  @Field(() => [OrderItemObject])
  orderItems: OrderItemObject[];

  // @Field(() => [StripePayment])
  // payments: StripePayment[];
}
