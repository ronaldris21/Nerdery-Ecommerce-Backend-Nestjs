import { Field, ObjectType } from "@nestjs/graphql";
import { Product } from "../entities/product.entity";
import { PaginationMeta } from "src/common/pagination/pagination-meta.object";

@ObjectType()
export class ProductsPagination {
    @Field(() => [Product])
    collection: Product[];

    @Field()
    meta: PaginationMeta;

}