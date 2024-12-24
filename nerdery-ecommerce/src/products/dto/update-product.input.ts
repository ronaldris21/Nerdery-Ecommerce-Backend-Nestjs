import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateProductInput } from './create-product.input';
import { IsString, IsUUID } from 'class-validator';

@InputType()
export class UpdateProductInput extends PartialType(CreateProductInput) {

    @Field()
    @IsString()
    @IsUUID()
    id: string;
}
