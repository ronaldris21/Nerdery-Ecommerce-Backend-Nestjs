// order-filter.input.ts
import { InputType, Field } from '@nestjs/graphql';
import { OrderStatusEnum } from '@prisma/client';

@InputType()
export class OrderFilterInput {
  @Field(() => OrderStatusEnum, { nullable: true })
  status?: OrderStatusEnum;

  //TODO: how to filter by date??
  @Field({ nullable: true })
  afterDate?: string;

  @Field({ nullable: true })
  beforeDate?: string;
}
