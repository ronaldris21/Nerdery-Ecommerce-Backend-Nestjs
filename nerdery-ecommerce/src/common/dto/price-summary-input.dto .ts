import { DiscountType } from 'src/common/enums/discount-type.enum';
export interface PriceSummaryInput {
  unitPrice: number;
  discountType: DiscountType;
  discount: number;
  quantity: number;
}
