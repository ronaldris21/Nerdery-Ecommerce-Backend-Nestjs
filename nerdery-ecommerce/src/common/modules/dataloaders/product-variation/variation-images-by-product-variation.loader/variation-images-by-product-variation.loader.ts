import { Injectable, Scope } from '@nestjs/common';
import { VariationImage } from '@prisma/client';
import DataLoader from 'dataloader';

import { DataloadersService } from '../../dataloaders.service';

@Injectable({ scope: Scope.REQUEST })
export class VariationImagesByProductVariationLoader extends DataLoader<string, VariationImage[]> {
  constructor(private readonly dataloadersService: DataloadersService) {
    super((keys: string[]) => this.batchLoadFunction(keys));
  }

  async batchLoadFunction(productVariationIds: string[]): Promise<VariationImage[][]> {
    const details =
      await this.dataloadersService.listVariationImagesByProductVariation(productVariationIds);

    return this.mapResults(productVariationIds, details);
  }

  mapResults(productVariationIds: string[], details: VariationImage[]): VariationImage[][] {
    return productVariationIds.map((productVariationId) => {
      return details.filter((detail) => detail.productVariationId === productVariationId);
    });
  }
}
