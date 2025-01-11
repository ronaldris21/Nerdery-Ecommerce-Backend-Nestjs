import { Injectable, Scope } from '@nestjs/common';
import { ProductVariation } from '@prisma/client';
import DataLoader from 'dataloader';

import { DataloadersService } from '../../dataloaders.service';

@Injectable({ scope: Scope.REQUEST })
export class ProductVariationByOrderItemLoader extends DataLoader<string, ProductVariation> {
  constructor(private readonly dataloadersService: DataloadersService) {
    super((keys: string[]) => this.batchLoadFunction(keys));
  }

  // THIS IS A 1 TO 1 RELATIONSHIP
  async batchLoadFunction(orderProductVariationIds: string[]): Promise<ProductVariation[]> {
    const details =
      await this.dataloadersService.listProductVariationByOrderItem(orderProductVariationIds);

    return this.mapResults(orderProductVariationIds, details);
  }

  mapResults(productVariationIds: string[], details: ProductVariation[]): ProductVariation[] {
    return productVariationIds.map((productVariationId) => {
      return details.find((detail) => detail.id === productVariationId); // 1 to 1 relationship
    });
  }
}
