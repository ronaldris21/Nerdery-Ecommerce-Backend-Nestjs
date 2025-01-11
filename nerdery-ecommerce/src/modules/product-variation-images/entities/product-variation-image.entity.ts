import { ObjectType, Field } from '@nestjs/graphql';
import { IsUrl, IsUUID } from 'class-validator';

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
}
