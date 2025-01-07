import { ObjectType, Field, ID } from '@nestjs/graphql';

import { Gender } from '../../../common/data/enums/gender.enum';
import { CategoryObject } from '../../categories/entities/category.entity';
import { ProductVariationObject } from '../../product-variations/entities/product-variation.entity';

@ObjectType()
export class ProductObject {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => Gender)
  gender: Gender;

  @Field(() => String, { nullable: true })
  thumbnailUrl?: string;

  @Field(() => ID)
  categoryId: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field()
  isEnabled: boolean;

  @Field()
  isDeleted: boolean;

  @Field()
  likesCount: number;

  @Field()
  minPrice: number;

  @Field()
  maxPrice: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => CategoryObject)
  category: CategoryObject;

  @Field(() => [ProductVariationObject], { nullable: true })
  productVariations?: ProductVariationObject[];
}
