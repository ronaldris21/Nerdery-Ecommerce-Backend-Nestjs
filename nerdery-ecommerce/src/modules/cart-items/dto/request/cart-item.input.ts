import { InputType, Int, Field } from '@nestjs/graphql';
import { IsInt, IsUUID, Min } from 'class-validator';

@InputType()
export class CartItemInput {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  readonly quantity: number;

  @Field()
  @IsUUID()
  readonly productVariationId: string;
}
