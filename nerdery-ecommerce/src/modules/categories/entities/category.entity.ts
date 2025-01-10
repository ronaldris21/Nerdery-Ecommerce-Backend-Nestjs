import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ProductObject } from 'src/modules/products/entities/product.entity';

@ObjectType()
export class CategoryObject {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => ID, { nullable: true })
  parentId?: string;

  @Field(() => [CategoryObject], { nullable: true })
  subCategories?: CategoryObject[];

  @Field(() => [ProductObject])
  products?: ProductObject[];
}
