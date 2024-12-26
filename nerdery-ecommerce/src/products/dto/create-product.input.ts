import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsUUID, IsBoolean, IsNotEmpty } from 'class-validator';
import { Gender } from 'src/common/enums/gender.enum';

@InputType()
export class CreateProductInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field(() => Gender)
  @IsNotEmpty()
  gender: Gender;

  @Field()
  @IsUUID()
  categoryId: string;

  @Field()
  @IsString()
  description: string;

  @Field(() => Boolean, { defaultValue: false })
  isEnabled: boolean;
}
