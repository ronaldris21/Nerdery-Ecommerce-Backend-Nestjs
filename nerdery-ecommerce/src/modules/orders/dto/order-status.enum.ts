// order-status.enum.ts
import { registerEnumType } from '@nestjs/graphql';
import { OrderStatusEnum } from '@prisma/client';

export { OrderStatusEnum as OrderStatus };

registerEnumType(OrderStatusEnum, {
  name: 'OrderStatus',
});
