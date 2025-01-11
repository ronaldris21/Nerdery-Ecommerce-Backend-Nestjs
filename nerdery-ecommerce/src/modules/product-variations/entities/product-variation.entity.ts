import { ObjectType, Field, ID } from '@nestjs/graphql';
import Decimal from 'decimal.js';
import { DiscountType } from 'src/common/data/enums/discount-type.enum';
import { ProductVariationImageObject } from 'src/modules/product-variation-images/entities/product-variation-image.entity';
import { ProductObject } from 'src/modules/products/entities/product.entity';

@ObjectType()
export class ProductVariationObject {
  @Field(() => ID)
  id: string;

  @Field()
  price: Decimal;

  @Field({ nullable: true })
  discount?: Decimal;

  @Field(() => DiscountType, { nullable: true })
  discountType?: DiscountType;

  @Field(() => String)
  size: string;

  @Field(() => String)
  color: string;

  @Field(() => Number)
  stock: number;

  @Field(() => Date)
  stockRefilledAt: Date;

  @Field(() => Boolean)
  isEnabled: boolean;

  @Field(() => Boolean)
  isDeleted: boolean;

  @Field(() => String)
  productId: string;

  @Field(() => ProductObject)
  product?: ProductObject;

  @Field(() => [ProductVariationImageObject])
  variationImages?: ProductVariationImageObject[];
}
