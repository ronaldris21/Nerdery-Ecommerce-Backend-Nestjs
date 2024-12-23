import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';

@Resolver(() => Category)
export class CategoriesResolver {
  constructor(private readonly categoriesService: CategoriesService) { }

  @Query(() => [Category])
  async categories(@Args('search', { nullable: true }) search: string) {
    return this.categoriesService.findBySearch(search);
  }

}
