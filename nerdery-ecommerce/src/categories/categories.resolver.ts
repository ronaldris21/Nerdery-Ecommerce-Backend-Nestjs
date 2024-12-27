import { Resolver, Query, Args } from '@nestjs/graphql';

import { CategoriesService } from './categories.service';
import { CategoryObject } from './entities/category.entity';

@Resolver(() => CategoryObject)
export class CategoriesResolver {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Query(() => [CategoryObject])
  async categories(@Args('search', { nullable: true }) search: string) {
    return this.categoriesService.findBySearch(search);
  }
}
