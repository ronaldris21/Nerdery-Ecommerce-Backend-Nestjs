import { CreateProductVariationImageInput } from './create-product-variation-image.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateProductVariationImageInput extends PartialType(CreateProductVariationImageInput) {
  @Field(() => Int)
  id: number;
}
