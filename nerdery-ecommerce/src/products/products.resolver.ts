import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { PaginationInput } from 'src/common/pagination/pagination.input';
import { ProductFiltersInput } from './dto/product-filters.input';
import { ProductsPagination } from './dto/products-pagination.object';
import { SortingProductInput } from './dto/sorting-product.input';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { ParseUUIDPipe } from '@nestjs/common';

@Resolver(() => Product)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) { }

  @Query(() => ProductsPagination)
  async products(
    @Args('filter', { nullable: true }) filter?: ProductFiltersInput,
    @Args('sortBy', { nullable: true }) sortBy?: SortingProductInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    return this.productsService.findAll(filter, sortBy, pagination);
  }

  @Query(() => Product, { nullable: true })
  async productById(@Args('id', { type: () => String }, ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }


  @Mutation(() => Product)
  async createProduct(@Args('input') input: CreateProductInput) {
    return this.productsService.create(input);
  }

  @Mutation(() => Product)
  async updateProduct(
    @Args('input') input: UpdateProductInput,
  ) {
    return this.productsService.update(input);
  }

  @Mutation(() => Product)
  async deleteProduct(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string
  ) {
    return await this.productsService.delete(id);
  }

  @Mutation(() => Product)
  async toggleProductEnable(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
    @Args('isEnabled') isEnabled: boolean
  ) {
    return await this.productsService.toggleIsEnabled(id, isEnabled);
  }

}
