import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { PaginationInput } from 'src/common/pagination/pagination.input';
import { ProductFiltersInput } from './dto/product-filters.input';
import { ProductsPagination } from './dto/products-pagination.object';
import { SortingProductInput } from './dto/sorting-product.input';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { AccessTokenWithRolesGuard } from 'src/auth/guards/access-token-with-roles.guard';
import { Roles } from 'src/auth/decoratos/roles.decorator';
import { ROLES } from 'src/common/constants';
import { GetUser } from 'src/auth/decoratos/get-user.decorator';
import { JwtPayloadDto } from 'src/auth/dto/jwtPayload.dto';

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


  @Query(() => ProductsPagination)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.MANAGER])
  async allProducts(
    @Args('filter', { nullable: true }) filter?: ProductFiltersInput,
    @Args('sortBy', { nullable: true }) sortBy?: SortingProductInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    return this.productsService.findAll(filter, sortBy, pagination, true);
  }

  @Query(() => Product, { nullable: true })
  async productById(@Args('id', { type: () => String }, ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }


  @Mutation(() => Product)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.MANAGER])
  async createProduct(@Args('input') input: CreateProductInput) {
    return this.productsService.create(input);
  }

  @Mutation(() => Product)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.MANAGER])
  async updateProduct(
    @Args('input') input: UpdateProductInput,
  ) {
    return this.productsService.update(input);
  }

  @Mutation(() => Product)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.MANAGER])
  async deleteProduct(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string
  ) {
    return await this.productsService.delete(id);
  }

  @Mutation(() => Product)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.MANAGER])
  async toggleProductEnable(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
    @Args('isEnabled') isEnabled: boolean
  ) {
    return await this.productsService.toggleIsEnabled(id, isEnabled);
  }

}
