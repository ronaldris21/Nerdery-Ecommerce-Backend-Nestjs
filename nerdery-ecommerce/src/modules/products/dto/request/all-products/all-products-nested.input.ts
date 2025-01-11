import { InputType, Field } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { PaginationInput } from 'src/common/data/pagination/pagination.input';

import { ProductFiltersInput } from './product-filters.input';
import { SortingProductInput } from './sorting-product.input';

@InputType()
export class AllProductsNestedInput {
  @Field({ nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductFiltersInput)
  readonly filter?: ProductFiltersInput;

  @Field({ nullable: true })
  @IsOptional()
  @Type(() => SortingProductInput)
  readonly sortBy?: SortingProductInput;

  @Field({ nullable: true })
  @ValidateNested()
  @Type(() => PaginationInput)
  @IsOptional()
  readonly pagination?: PaginationInput;
}
