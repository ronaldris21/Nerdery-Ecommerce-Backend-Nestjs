import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

import { CreateProductVariationImageInput } from './create-product-variation-image.input';

@InputType()
export class UpdateProductVariationImageInput extends PartialType(
  CreateProductVariationImageInput,
) {
  @Field(() => Int)
  id: number;
}
