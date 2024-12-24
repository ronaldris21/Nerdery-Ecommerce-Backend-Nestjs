import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsPositive } from 'class-validator';

@InputType()
export class PaginationInput {
    @Field(() => Int, { nullable: true, defaultValue: 1 }) // Default to page 1
    @IsInt()
    @IsOptional()
    @IsPositive()
    page?: number;

    @Field(() => Int, { nullable: true, defaultValue: 20 }) // Default to 20 items per page
    @IsInt()
    @IsOptional()
    @IsPositive()
    limit?: number;
}
