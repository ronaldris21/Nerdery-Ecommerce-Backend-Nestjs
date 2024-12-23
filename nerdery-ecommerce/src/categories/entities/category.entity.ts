import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Product } from 'src/products/entities/product.entity';

@ObjectType()
export class Category {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => ID, { nullable: true })
  parentId?: string;

  @Field(() => [Category], { nullable: true })
  subCategories?: Category[];

  @Field(() => [Product])
  products: Product[];
}
