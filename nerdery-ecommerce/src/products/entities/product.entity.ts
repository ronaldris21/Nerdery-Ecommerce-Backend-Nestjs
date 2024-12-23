import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Gender } from '../../common/enums/gender.enum';
import { Category } from '../../categories/entities/category.entity';
import { ProductVariation } from '../../product-variations/entities/product-variation.entity';

@ObjectType()
export class Product {
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

  @Field(() => Category)
  category: Category;

  @Field(() => [ProductVariation], { nullable: true })
  productVariations?: ProductVariation[];
}
