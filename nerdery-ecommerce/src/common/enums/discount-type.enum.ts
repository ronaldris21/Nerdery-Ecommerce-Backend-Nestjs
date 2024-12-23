import { registerEnumType } from '@nestjs/graphql';

export enum DiscountType {
    PERCENTAGE = 'PERCENTAGE',
    DOLLAR_SIGN = 'DOLLAR_SIGN',
}

registerEnumType(DiscountType, { name: 'DiscountType' });
