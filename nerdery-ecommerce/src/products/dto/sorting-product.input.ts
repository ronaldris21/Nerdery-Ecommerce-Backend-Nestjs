import { InputType, Field } from '@nestjs/graphql';

import { registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, isNotEmpty, IsOptional } from 'class-validator';
import { SortOrder } from 'src/common/enums/sort-order.enum';

//TODO: match field names with the actual fields in the Product entity
export enum ProductSortableField {
    NAME = 'name',
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
    LIKES_COUNT = 'likesCount',
    PRICE = 'PRICE', // This may be derived from related data.
}

registerEnumType(ProductSortableField, { name: 'ProductSortableField' });


@InputType()
export class SortingProductInput {
    @Field(() => ProductSortableField, { defaultValue: ProductSortableField.NAME })
    @IsOptional()
    @IsEnum(ProductSortableField)
    field: ProductSortableField;

    @Field(() => SortOrder, { defaultValue: SortOrder.ASC })
    @IsOptional()
    @IsEnum(SortOrder)
    order: SortOrder;
}
