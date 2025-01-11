import Decimal from 'decimal.js';

export interface PriceSummary {
  unitPrice: Decimal;
  subTotal: Decimal;
  discount: Decimal;
  total: Decimal;
}
