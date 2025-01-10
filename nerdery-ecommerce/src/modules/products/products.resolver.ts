import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Resolver, Query, Args, Mutation, Parent, ResolveField } from '@nestjs/graphql';
import { ROLES } from 'src/common/constants';
import { AfterLoadersService } from 'src/common/modules/dataloaders/after-loaders.service';
import { CategoryByProductLoader } from 'src/common/modules/dataloaders/products/category-by-product.loader/category-by-product.loader';
import { ProductVariationByProductLoader } from 'src/common/modules/dataloaders/products/product-variation-by-product.loader/product-variation-by-product.loader';
import { Roles } from 'src/modules/auth/decoratos/roles.decorator';
import { AccessTokenWithRolesGuard } from 'src/modules/auth/guards/access-token-with-roles.guard';

import { GetAccessToken } from '../auth/decoratos/get-jwtPayload.decorator';
import { CategoryObject } from '../categories/entities/category.entity';
import { ProductVariationObject } from '../product-variations/entities/product-variation.entity';

import { AllProductsNestedInput } from './dto/request/all-products/all-products-nested.input';
import { CreateProductInput } from './dto/request/create-product.input';
import { ToggleProductInput } from './dto/request/toggle-product.input';
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
    @Args('productInputs', { nullable: true }) productInputs?: AllProductsNestedInput,
  ): Promise<ProductsPagination> {
    return this.productsService.findAll(productInputs);
  }

  @Query(() => ProductsPagination)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.MANAGER])
  allProducts(
    @Args('productInputs', { nullable: true }) productInputs?: AllProductsNestedInput,
  ): Promise<ProductsPagination> {
    return this.productsService.findAll(productInputs, true);
  }

  @Query(() => ProductObject, { nullable: true })
  productById(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
  ): Promise<ProductObject> {
    return this.productsService.findOne(id);
  }

  @Mutation(() => ProductObject)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.MANAGER])
  createProduct(@Args('input') input: CreateProductInput): Promise<ProductObject> {
    return this.productsService.create(input);
  }

  @Mutation(() => ProductObject)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.MANAGER])
  updateProduct(@Args('input') input: UpdateProductInput): Promise<ProductObject> {
    return this.productsService.update(input);
  }

  @Mutation(() => ProductObject)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.MANAGER])
  deleteProduct(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
  ): Promise<ProductObject> {
    return this.productsService.delete(id);
  }

  @Mutation(() => ProductObject)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.MANAGER])
  toggleProductEnable(@Args('input') input: ToggleProductInput): Promise<ProductObject> {
    return this.productsService.toggleIsEnabled(input.id, input.isEnabled);
  }

  @ResolveField(() => [ProductVariationObject])
  async productVariations(
    @Parent() product: ProductObject,
    @GetAccessToken() accessToken: string,
  ): Promise<ProductVariationObject[]> {
    //FILTER BY ROLE
    const loaderResults = await this.productVariationByProductLoader.load(product.id);
    return this.afterLoadersService.filterProductVariationsIfNoRequiredRole(
      loaderResults,
      accessToken,
      [ROLES.MANAGER],
    );
  }

  @ResolveField(() => [CategoryObject])
  async category(@Parent() product: ProductObject): Promise<CategoryObject> {
    return this.categoryByProductLoader.load(product.id);
  }
}
