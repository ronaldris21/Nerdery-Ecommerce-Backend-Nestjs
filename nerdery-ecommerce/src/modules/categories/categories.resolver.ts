import { Resolver, Query, Args, Parent, ResolveField } from '@nestjs/graphql';
import { ProductsBycategoryLoader } from 'src/common/modules/dataloaders/categories/products-bycategory.loader/products-by-category.loader';

import { ProductObject } from '../products/entities/product.entity';

import { CategoriesService } from './categories.service';
import { CategoryObject } from './entities/category.entity';

@Resolver(() => CategoryObject)
export class CategoriesResolver {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly productsBycategoryLoader: ProductsBycategoryLoader,
  ) {}

  @Query(() => [CategoryObject])
  async categories(@Args('search', { nullable: true }) search: string) {
    return this.categoriesService.findBySearch(search);
  }

  @ResolveField(() => [ProductObject])
  async products(@Parent() category: CategoryObject) {
    return this.productsBycategoryLoader.load(category.id);
  }
}
