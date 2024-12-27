import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { Roles } from 'src/auth/decoratos/roles.decorator';
import { AccessTokenWithRolesGuard } from 'src/auth/guards/access-token-with-roles.guard';
import { ROLES } from 'src/common/constants';
import { PaginationInput } from 'src/common/pagination/pagination.input';

import { CreateProductInput } from './dto/create-product.input';
import { ProductFiltersInput } from './dto/product-filters.input';
import { ProductsPagination } from './dto/products-pagination.object';
import { SortingProductInput } from './dto/sorting-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { ProductObject } from './entities/product.entity';
import { ProductsService } from './products.service';

@Resolver(() => ProductObject)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  @Query(() => ProductsPagination)
  products(
    @Args('filter', { nullable: true }) filter?: ProductFiltersInput,
    @Args('sortBy', { nullable: true }) sortBy?: SortingProductInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    return this.productsService.findAll(filter, sortBy, pagination);
  }

  @Query(() => ProductsPagination)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.MANAGER])
  allProducts(
    @Args('filter', { nullable: true }) filter?: ProductFiltersInput,
    @Args('sortBy', { nullable: true }) sortBy?: SortingProductInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    return this.productsService.findAll(filter, sortBy, pagination, true);
  }

  @Query(() => ProductObject, { nullable: true })
  productById(@Args('id', { type: () => String }, ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Mutation(() => ProductObject)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.MANAGER])
  createProduct(@Args('input') input: CreateProductInput) {
    return this.productsService.create(input);
  }

  @Mutation(() => ProductObject)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.MANAGER])
  updateProduct(@Args('input') input: UpdateProductInput) {
    return this.productsService.update(input);
  }

  @Mutation(() => ProductObject)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.MANAGER])
  deleteProduct(@Args('id', { type: () => String }, ParseUUIDPipe) id: string) {
    return this.productsService.delete(id);
  }

  @Mutation(() => ProductObject)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.MANAGER])
  toggleProductEnable(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
    @Args('isEnabled') isEnabled: boolean,
  ) {
    return this.productsService.toggleIsEnabled(id, isEnabled);
  }
}
