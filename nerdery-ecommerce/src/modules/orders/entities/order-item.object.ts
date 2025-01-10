import { Field, ObjectType, ID } from '@nestjs/graphql';
import Decimal from 'decimal.js';
import { ProductVariationObject } from 'src/modules/product-variations/entities/product-variation.entity';

@ObjectType()
export class OrderItemObject {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  orderId: string;

  @Field(() => ID)
  productVariationId: string;

  @Field()
  unitPrice: Decimal;

  @Field()
  subTotal: Decimal;

  @Field()
  discount: Decimal;

  @Field()
  total: Decimal;

  @Field(() => ProductVariationObject)
  productVariation?: ProductVariationObject;
}
