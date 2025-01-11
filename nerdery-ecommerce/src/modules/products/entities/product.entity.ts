import { ObjectType, Field, ID } from '@nestjs/graphql';
import Decimal from 'decimal.js';

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

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field(() => ID)
  categoryId: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  isEnabled: boolean;

  @Field()
  isDeleted: boolean;

  @Field()
  likesCount: number;

  @Field()
  minPrice: Decimal;

  @Field()
  maxPrice: Decimal;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => CategoryObject)
  category?: CategoryObject;

  @Field(() => [ProductVariationObject], { nullable: true })
  productVariations?: ProductVariationObject[];
}
