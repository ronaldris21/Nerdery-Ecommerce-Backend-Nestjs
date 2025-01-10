import { InputType, Field, PartialType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

import { CreateProductVariationInput } from './create-product-variation.input';

@InputType()
export class UpdateProductVariationInput extends PartialType(CreateProductVariationInput) {
  @Field(() => String)
  @IsUUID()
  readonly id: string;
}
