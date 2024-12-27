import { Field, ObjectType } from '@nestjs/graphql';
import { PaginationMeta } from 'src/common/pagination/pagination-meta.object';

import { ProductObject } from '../entities/product.entity';

@ObjectType()
export class ProductsPagination {
  @Field(() => [ProductObject])
  collection: ProductObject[];

  @Field()
  meta: PaginationMeta;
}
