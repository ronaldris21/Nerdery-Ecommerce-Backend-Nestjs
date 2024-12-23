import { InputType, Field } from '@nestjs/graphql';

import { registerEnumType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
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
    @Field(() => ProductSortableField)
    field: ProductSortableField;

    @Field(() => SortOrder)
    @IsOptional()
    order: SortOrder;
}
