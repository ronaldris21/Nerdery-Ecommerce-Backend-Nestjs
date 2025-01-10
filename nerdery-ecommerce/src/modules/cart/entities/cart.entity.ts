import { ObjectType, Field } from '@nestjs/graphql';
import Decimal from 'decimal.js';
import { CartItemObject } from 'src/modules/cart-items/entities/cart-item.object';

@ObjectType()
export class CartObject {
  @Field()
  subTotal: Decimal;

  @Field({ defaultValue: new Decimal(0) })
  discount: Decimal;

  @Field()
  total: Decimal;

  @Field(() => [CartItemObject])
  items: CartItemObject[];
}
