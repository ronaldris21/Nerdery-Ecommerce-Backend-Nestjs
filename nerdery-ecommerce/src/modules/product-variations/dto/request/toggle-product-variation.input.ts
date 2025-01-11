import { InputType, Field } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class ToggleProductVariationInput {
  @Field(() => String)
  @IsUUID()
  readonly id: string;

  @Field(() => Boolean)
  readonly isEnabled: boolean;
}
