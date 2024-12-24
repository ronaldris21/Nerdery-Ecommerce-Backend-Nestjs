import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { DiscountType } from 'src/common/enums/discount-type.enum';
import { ProductVariationImage } from 'src/product-variation-images/entities/product-variation-image.entity';
import { Product } from 'src/products/entities/product.entity';

@ObjectType()
export class ProductVariation {
  @Field(() => ID)
  id: string;

  @Field(() => Float)
  price: number;

  @Field(() => Float, { nullable: true })
  discount?: number;

  @Field(() => DiscountType, { nullable: true })
  discountType?: DiscountType;

  @Field(() => String)
  size: string;

  @Field(() => String)
  color: string;

  @Field(() => Number)
  stock: number;

  @Field(() => String)
  stockRefilledAt: string;

  @Field(() => Boolean)
  isEnabled: boolean;

  @Field(() => Boolean)
  isDeleted: boolean;

  @Field(() => Product)
  product: Product;

  @Field(() => [ProductVariationImage])
  variationImages: ProductVariationImage[];
}
