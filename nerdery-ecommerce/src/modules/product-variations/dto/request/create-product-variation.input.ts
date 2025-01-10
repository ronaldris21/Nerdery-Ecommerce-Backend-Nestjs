import { InputType, Field, Float } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsNotIn, IsNumber, IsPositive, IsUUID, Min } from 'class-validator';
import { DiscountType } from 'src/common/data/enums/discount-type.enum';

@InputType()
export class CreateProductVariationInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  readonly productId: string;

  @Field(() => Number)
  @Min(0)
  @IsInt()
  readonly stock: number;

  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  @IsNotIn([0, 0.0], { message: 'Price cannot be zero' })
  @Min(0.01)
  readonly price: number;

  @Field(() => Float, { nullable: true, defaultValue: 0.0 })
  @IsNumber()
  @Min(0)
  readonly discount?: number;

  @Field(() => DiscountType, {
    nullable: true,
    defaultValue: DiscountType.NONE,
  })
  readonly discountType: DiscountType;

  @Field(() => String)
  @IsNotEmpty()
  readonly size: string;

  @Field(() => String)
  @IsNotEmpty()
  readonly color: string;

  @Field(() => Boolean, { defaultValue: true })
  readonly isEnabled: boolean;
}
