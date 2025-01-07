import { DiscountType } from 'src/common/data/enums/discount-type.enum';
export interface PriceSummaryInput {
  unitPrice: number;
  discountType: DiscountType;
  discount: number;
  quantity: number;
}
