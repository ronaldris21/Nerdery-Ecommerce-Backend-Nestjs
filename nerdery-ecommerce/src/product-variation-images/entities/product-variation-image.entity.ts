import { ObjectType, Field, Int } from '@nestjs/graphql';
import { isNotEmpty, IsUrl, IsUUID } from 'class-validator';
import { ProductVariation } from 'src/product-variations/entities/product-variation.entity';

@ObjectType()
export class ProductVariationImage {
  @Field()
  @IsUUID()
  id: string;

  @Field()
  @IsUrl()
  imageUrl: string;

  @Field()
  @IsUUID()
  productVariationId: string;

  @Field(() => ProductVariation)
  productVariation: ProductVariation;
}