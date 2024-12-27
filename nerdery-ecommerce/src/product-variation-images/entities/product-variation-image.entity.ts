import { ObjectType, Field } from '@nestjs/graphql';
import { IsUrl, IsUUID } from 'class-validator';
import { ProductVariationObject } from 'src/product-variations/entities/product-variation.entity';

@ObjectType()
export class ProductVariationImageObject {
  @Field()
  @IsUUID()
  id: string;

  @Field()
  @IsUrl()
  imageUrl: string;

  @Field()
  @IsUUID()
  productVariationId: string;

  @Field(() => ProductVariationObject)
  productVariation: ProductVariationObject;
}
