import { Injectable, Scope } from '@nestjs/common';
import { Category } from '@prisma/client';
import DataLoader from 'dataloader';

import { DataloadersService } from '../../dataloaders.service';

// 1 to N relationship between Category and Product
export type CategoryByProduct = Category & { products: { id: string }[] };

@Injectable({ scope: Scope.REQUEST })
export class CategoryByProductLoader extends DataLoader<string, Category> {
  constructor(private readonly dataloadersService: DataloadersService) {
    super((keys: string[]) => this.batchLoadFunction(keys));
  }

  async batchLoadFunction(productIds: string[]): Promise<Category[]> {
    const details = await this.dataloadersService.listCategoryByProduct(productIds);

    return this.mapResults(productIds, details as CategoryByProduct[]);
  }

  mapResults(productIds: string[], allCategories: CategoryByProduct[]): Category[] {
    return productIds.map((productId) => {
      return allCategories.find((category) =>
        category.products.some((product) => product.id === productId),
      );
    });
  }
}
