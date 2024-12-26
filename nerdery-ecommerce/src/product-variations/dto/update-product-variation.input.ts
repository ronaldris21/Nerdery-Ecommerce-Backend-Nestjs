import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateProductVariationInput } from './create-product-variation.input';
import { IsUUID } from 'class-validator';

@InputType()
export class UpdateProductVariationInput extends PartialType(CreateProductVariationInput) {
  @Field(() => String)
  @IsUUID()
  id: string;
}
