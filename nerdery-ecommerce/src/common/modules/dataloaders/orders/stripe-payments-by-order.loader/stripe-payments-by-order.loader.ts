import { Injectable, Scope } from '@nestjs/common';
import { StripePayment } from '@prisma/client';
import DataLoader from 'dataloader';

import { DataloadersService } from '../../dataloaders.service';

@Injectable({ scope: Scope.REQUEST })
export class StripePaymentsByOrderLoader extends DataLoader<string, StripePayment[]> {
  constructor(private readonly dataloadersService: DataloadersService) {
    super((keys: string[]) => this.batchLoadFunction(keys));
  }

  async batchLoadFunction(OrderIds: string[]) {
    const details = await this.dataloadersService.listStripePaymentsByOrder(OrderIds);

    console.log('details - StripePayment', details);
    return this.mapResults(OrderIds, details);
  }

  mapResults(OrderIds: string[], details: StripePayment[]): StripePayment[][] {
    return OrderIds.map((OrderId) => {
      return details.filter((detail) => detail.orderId === OrderId);
    });
  }
}
