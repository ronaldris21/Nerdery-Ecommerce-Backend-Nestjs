import { InputType, Field } from '@nestjs/graphql';
import { Gender } from '../../common/enums/gender.enum';
import { IsUUID, IsString, IsOptional, IsPositive } from 'class-validator';

@InputType()
export class ProductFiltersInput {
    @Field(() => Gender, { nullable: true })
    @IsOptional()
    gender?: Gender;

    @Field(() => String, { nullable: true })
    @IsUUID()
    @IsOptional()
    categoryId?: string;

    @Field(() => String, { nullable: true })
    @IsString()
    @IsOptional()
    search?: string;

    @Field(() => Number, { nullable: true })
    @IsPositive()
    @IsOptional()
    minPrice?: number;

    @Field(() => Number, { nullable: true })
    @IsPositive()
    @IsOptional()
    maxPrice?: number;
}
