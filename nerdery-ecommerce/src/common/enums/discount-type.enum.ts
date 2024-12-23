import { registerEnumType } from '@nestjs/graphql';
import { DiscountTypeEnum, GenderEnum, Prisma } from '@prisma/client';

// export enum DiscountType {
//     PERCENTAGE = 'PERCENTAGE',
//     DOLLAR_SIGN = 'DOLLAR_SIGN',
// }

export { DiscountTypeEnum as DiscountType };

registerEnumType(DiscountTypeEnum, { name: 'DiscountType' });
