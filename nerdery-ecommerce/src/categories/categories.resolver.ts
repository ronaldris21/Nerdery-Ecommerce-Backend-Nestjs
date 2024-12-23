import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { SearchInput } from './dto/search.input';
import { Search } from '@nestjs/common';

@Resolver(() => Category)
export class CategoriesResolver {
  constructor(private readonly categoriesService: CategoriesService) { }

  @Query(() => [Category])
  async categories(@Args('search', { nullable: true }) search: string) {
    return this.categoriesService.findBySearch(search);
  }

}
