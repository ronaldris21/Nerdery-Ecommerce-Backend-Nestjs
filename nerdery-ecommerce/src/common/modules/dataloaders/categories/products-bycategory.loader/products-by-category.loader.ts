import { Injectable, Scope } from '@nestjs/common';
import { Product } from '@prisma/client';
import DataLoader from 'dataloader';

import { DataloadersService } from '../../dataloaders.service';

@Injectable({ scope: Scope.REQUEST })
export class ProductsBycategoryLoader extends DataLoader<string, Product[]> {
  constructor(private readonly dataloadersService: DataloadersService) {
    super((keys: string[]) => this.batchLoadFunction(keys));
  }

  async batchLoadFunction(categoryIds: string[]): Promise<Product[][]> {
    const details = await this.dataloadersService.listProductsByCategory(categoryIds);

    return this.mapResults(categoryIds, details);
  }

  mapResults(categoryIds: string[], details: Product[]): Product[][] {
    return categoryIds.map((categoryId) => {
      return details.filter((detail) => detail.categoryId === categoryId);
    });
  }
}
