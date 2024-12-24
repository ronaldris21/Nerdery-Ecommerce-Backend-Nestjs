import { InputType, Field, Float } from '@nestjs/graphql';
import { DiscountType } from 'src/common/enums/discount-type.enum';

@InputType()
export class CreateProductVariationInput {
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

  @Field(() => Boolean)
  isEnabled: boolean;
}
