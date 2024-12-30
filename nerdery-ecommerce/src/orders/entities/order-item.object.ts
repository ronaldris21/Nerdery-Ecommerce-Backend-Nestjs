import { Field, Float, ObjectType, ID } from '@nestjs/graphql';
import { ProductVariationObject } from 'src/product-variations/entities/product-variation.entity';

import { StripePaymentObject } from './stripe-payment.object';

@ObjectType()
export class OrderItemObject {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  orderId: string;

  @Field(() => ID)
  productVariationId: string;

  @Field()
  unitPrice: number;

  @Field(() => Float)
  subTotal: number;

  @Field(() => Float)
  discount: number;

  @Field(() => Float)
  total: number;

  @Field(() => ProductVariationObject)
  productVariation: ProductVariationObject;

  @Field()
  payments: StripePaymentObject;
}
