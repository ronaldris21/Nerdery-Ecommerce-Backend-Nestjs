import { Int, Field, Float, ObjectType } from '@nestjs/graphql';
import { IsInt, IsUUID, Min } from 'class-validator';
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
  @Field(() => Float)
  unitPrice: number;

  @Field(() => Float)
  subTotal: number;

  @Field(() => Float)
  discount: number;

  @Field(() => Float)
  total: number;

  //relationship - resolved fields
  @Field(() => ProductVariationObject)
  productVariation?: ProductVariationObject;
}
