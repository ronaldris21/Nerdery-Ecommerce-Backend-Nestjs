import { ObjectType, Field, Float } from '@nestjs/graphql';
import { CartItemObject } from 'src/modules/cart-items/entities/cart-item.object';

@ObjectType()
export class CartObject {
  @Field(() => Float)
  subTotal: number;

  @Field(() => Float)
  discount: number;

  @Field(() => Float)
  total: number;

  @Field(() => [CartItemObject])
  items: CartItemObject[];
}
