import { Int, Field, ObjectType } from '@nestjs/graphql';
import { IsInt, IsUUID, Min } from 'class-validator';
import Decimal from 'decimal.js';
import { ProductVariationObject } from 'src/modules/product-variations/entities/product-variation.entity';

@ObjectType()
export class CartItemObject {
  //Database persisted fields
  @Field()
  @IsUUID()
  userId: string;

  @Field()
  @IsUUID()
  productVariationId: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  quantity: number;

  //Calculated fields on the server
  @Field()
  unitPrice: Decimal;

  @Field()
  subTotal: Decimal;

  @Field()
  discount: Decimal;

  @Field()
  total: Decimal;

  //relationship - resolved fields
  @Field(() => ProductVariationObject)
  productVariation?: ProductVariationObject;
}
