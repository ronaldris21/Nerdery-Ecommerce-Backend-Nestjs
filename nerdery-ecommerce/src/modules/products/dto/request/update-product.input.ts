import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsString, IsUUID } from 'class-validator';

import { CreateProductInput } from './create-product.input';

@InputType()
export class UpdateProductInput extends PartialType(CreateProductInput) {
  @Field()
  @IsString()
  @IsUUID()
  readonly id: string;
}
