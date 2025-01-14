import { Resolver, Query, Args, Parent, ResolveField } from '@nestjs/graphql';
import { Product } from '@prisma/client';
import { ROLES } from 'src/common/constants';
import { AfterLoadersService } from 'src/common/modules/dataloaders/after-loaders.service';
import { ProductsBycategoryLoader } from 'src/common/modules/dataloaders/categories/products-bycategory.loader/products-by-category.loader';

import { GetAccessToken } from '../auth/decoratos/get-jwtPayload.decorator';
import { ProductObject } from '../products/entities/product.entity';

import { CategoriesService } from './categories.service';
import { CategoryObject } from './entities/category.entity';

@Resolver(() => CategoryObject)
export class CategoriesResolver {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly productsBycategoryLoader: ProductsBycategoryLoader,
    private readonly afterLoadersService: AfterLoadersService,
  ) {}

  @Query(() => [CategoryObject])
  async categories(@Args('search', { nullable: true }) search: string): Promise<CategoryObject[]> {
    return this.categoriesService.findBySearch(search);
  }

  @ResolveField(() => [ProductObject])
  async products(
    @Parent() category: CategoryObject,
    @GetAccessToken() accessToken: string,
  ): Promise<Product[]> {
    const products = await this.productsBycategoryLoader.load(category.id);
    return this.afterLoadersService.filterProductsIfNoRequiredRole(products, accessToken, [
      ROLES.MANAGER,
    ]);
  }
}
