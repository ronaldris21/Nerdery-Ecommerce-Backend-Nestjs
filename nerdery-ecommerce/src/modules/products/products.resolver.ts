import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Resolver, Query, Args, Mutation, Parent, ResolveField } from '@nestjs/graphql';
import { ROLES } from 'src/common/constants';
import { PaginationInput } from 'src/common/data/pagination/pagination.input';
import { AfterLoadersService } from 'src/common/modules/dataloaders/after-loaders.service';
import { CategoryByProductLoader } from 'src/common/modules/dataloaders/products/category-by-product.loader/category-by-product.loader';
import { ProductVariationByProductLoader } from 'src/common/modules/dataloaders/products/product-variation-by-product.loader/product-variation-by-product.loader';
import { Roles } from 'src/modules/auth/decoratos/roles.decorator';
import { AccessTokenWithRolesGuard } from 'src/modules/auth/guards/access-token-with-roles.guard';

import { GetAccessToken } from '../auth/decoratos/get-jwtPayload.decorator';
import { ProductVariationObject } from '../product-variations/entities/product-variation.entity';

import { CreateProductInput } from './dto/request/create-product.input';
import { ProductFiltersInput } from './dto/request/product-filters.input';
import { SortingProductInput } from './dto/request/sorting-product.input';
import { UpdateProductInput } from './dto/request/update-product.input';
import { ProductsPagination } from './dto/response/products-pagination.object';
import { ProductObject } from './entities/product.entity';
import { ProductsService } from './products.service';

@Resolver(() => ProductObject)
export class ProductsResolver {
  constructor(
    private readonly productsService: ProductsService,
    private readonly productVariationByProductLoader: ProductVariationByProductLoader,
    private readonly afterLoadersService: AfterLoadersService,
    private readonly categoryByProductLoader: CategoryByProductLoader,
  ) {}

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

  @ResolveField(() => [ProductVariationObject])
  async productVariations(@Parent() product: ProductObject, @GetAccessToken() accessToken: string) {
    //FILTER BY ROLE
    const loaderResults = await this.productVariationByProductLoader.load(product.id);
    return this.afterLoadersService.filterProductVariationsIfNoRequiredRole(
      loaderResults,
      accessToken,
      [ROLES.MANAGER],
    );
  }

  @ResolveField(() => [ProductVariationObject])
  async category(@Parent() product: ProductObject) {
    return this.categoryByProductLoader.load(product.id);
  }
}
