import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateProductVariationInput } from './create-product-variation.input';

@InputType()
export class UpdateProductVariationInput extends PartialType(CreateProductVariationInput) {
  //TODO: should left the id here???
  @Field(() => String)
  id: string;
}
