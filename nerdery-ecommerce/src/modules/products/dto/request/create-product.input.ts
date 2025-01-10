import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsUUID, IsNotEmpty } from 'class-validator';
import { Gender } from 'src/common/data/enums/gender.enum';

@InputType()
export class CreateProductInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @Field(() => Gender)
  @IsNotEmpty()
  readonly gender: Gender;

  @Field()
  @IsUUID()
  readonly categoryId: string;

  @Field()
  @IsString()
  readonly description: string;

  @Field(() => Boolean, { defaultValue: false })
  readonly isEnabled: boolean;
}
