import { InputType, Field, Float } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsNotIn, IsNumber, IsPositive, IsUUID, Min } from 'class-validator';
import { DiscountType } from 'src/common/enums/discount-type.enum';

@InputType()
export class CreateProductVariationInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @Field(() => Number)
  @Min(0)
  @IsInt()
  stock: number;

  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  @IsNotIn([0, 0.0], { message: 'Price cannot be zero' })
  price: number;

  @Field(() => Float, { nullable: true, defaultValue: 0.0 })
  @IsNumber()
  @Min(0)
  discount?: number;

  @Field(() => DiscountType, {
    nullable: true,
    defaultValue: DiscountType.NONE,
  })
  discountType: DiscountType;

  @Field(() => String)
  @IsNotEmpty()
  size: string;

  @Field(() => String)
  @IsNotEmpty()
  color: string;

  @Field(() => Boolean, { defaultValue: true })
  isEnabled: boolean;
}
