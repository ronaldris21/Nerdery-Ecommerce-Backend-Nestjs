import { Resolver, Query, Args } from '@nestjs/graphql';
import { PaginationInput } from 'src/common/pagination/pagination.input';

import { ProductFiltersInput } from './dto/product-filters.input';
import { ProductsPagination } from './dto/products-pagination.object';
import { SortingProductInput } from './dto/sorting-product.input';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { ParseUUIDPipe } from '@nestjs/common';

@Resolver(() => Product)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) { }

  @Query(() => ProductsPagination)
  async products(
    @Args('filter', { nullable: true }) filter: ProductFiltersInput,
    @Args('sortBy', { nullable: true }) sortBy: SortingProductInput,
    @Args('pagination', { nullable: true }) pagination: PaginationInput,
  ) {
    return this.productsService.findAll(filter, sortBy, pagination);
  }

  @Query(() => Product, { nullable: true })
  async productById(@Args('id', { type: () => String }, ParseUUIDPipe) id: string) {
    return this.productsService.findById(id);
  }


}
