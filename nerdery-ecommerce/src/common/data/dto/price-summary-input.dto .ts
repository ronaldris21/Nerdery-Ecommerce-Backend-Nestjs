import Decimal from 'decimal.js';
import { DiscountType } from 'src/common/data/enums/discount-type.enum';
export interface PriceSummaryInput {
  unitPrice: Decimal;
  discountType: DiscountType;
  discount: Decimal;
  quantity: number;
}
