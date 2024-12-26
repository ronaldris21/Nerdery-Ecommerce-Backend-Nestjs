import { Field, ObjectType } from "@nestjs/graphql";
import { Product } from "../entities/product.entity";
import { PaginationMeta } from "src/common/pagination/pagination-meta.object";

type ProductCursor = Product & { cursor: string };

@ObjectType()
export class ProductsPagination {
    @Field(() => [Product])
    collection: ProductCursor[];

    @Field()
    meta: PaginationMeta;

}