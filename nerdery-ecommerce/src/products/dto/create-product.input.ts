import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsUUID, IsBoolean } from 'class-validator';
import { Gender } from 'src/common/enums/gender.enum';

@InputType()
export class CreateProductInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => Gender)
  gender: Gender;

  @Field(() => String)
  @IsUUID()
  categoryId: string;

  @Field()
  @IsString()
  description: string;

  @Field()
  @IsBoolean()
  isEnabled: boolean;
}
