import { Injectable, Scope } from '@nestjs/common';
import { ProductVariation } from '@prisma/client';
import DataLoader from 'dataloader';

import { DataloadersService } from '../../dataloaders.service';

@Injectable({ scope: Scope.REQUEST })
export class ProductVariationByProductLoader extends DataLoader<string, ProductVariation[]> {
  constructor(private readonly dataloadersService: DataloadersService) {
    super((keys: string[]) => this.batchLoadFunction(keys));
  }

  async batchLoadFunction(ProductIds: string[]) {
    const details = await this.dataloadersService.listProductVariationByProduct(ProductIds);

    return this.mapResults(ProductIds, details);
  }

  mapResults(ProductIds: string[], details: ProductVariation[]): ProductVariation[][] {
    return ProductIds.map((ProductId) => {
      return details.filter((detail) => detail.productId === ProductId);
    });
  }
}
