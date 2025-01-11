import { InputType, Field, Int } from '@nestjs/graphql';
import { IsUUID, IsString, IsOptional, IsPositive } from 'class-validator';
import { Gender } from 'src/common/data/enums/gender.enum';

@InputType()
export class ProductFiltersInput {
  @Field(() => Gender, { nullable: true })
  @IsOptional()
  readonly gender?: Gender;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  readonly categoryId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  readonly search?: string;

  @Field(() => Int, { nullable: true })
  @IsPositive()
  @IsOptional()
  readonly minPrice?: number;

  @Field()
  @IsPositive()
  @IsOptional()
  readonly maxPrice?: number;
}
