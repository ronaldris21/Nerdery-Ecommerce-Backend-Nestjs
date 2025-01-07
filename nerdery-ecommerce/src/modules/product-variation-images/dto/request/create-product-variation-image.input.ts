import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateProductVariationImageInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
