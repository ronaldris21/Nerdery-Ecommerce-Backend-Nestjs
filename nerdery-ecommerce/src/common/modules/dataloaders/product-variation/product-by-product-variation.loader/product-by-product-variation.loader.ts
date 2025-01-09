import { Injectable, Scope } from '@nestjs/common';
import { Product } from '@prisma/client';
import DataLoader from 'dataloader';

import { DataloadersService } from '../../dataloaders.service';

// 1 to N relationship between Product and ProductVariations
export type ProductByProductVariation = Product & { productVariations: { id: string }[] };
@Injectable({ scope: Scope.REQUEST })
export class ProductByProductVariationLoader extends DataLoader<string, Product> {
  constructor(private readonly dataloadersService: DataloadersService) {
    super((keys: string[]) => this.batchLoadFunction(keys));
  }

  async batchLoadFunction(productVariationIds: string[]) {
    const details =
      await this.dataloadersService.listProductByProductVariation(productVariationIds);
    return this.mapResults(productVariationIds, details as ProductByProductVariation[]);
  }

  mapResults(productVariationIds: string[], allProducts: ProductByProductVariation[]): Product[] {
    return productVariationIds.map((productVariationId) => {
      return allProducts.find((product) =>
        product.productVariations.some(
          (productVariation) => productVariation.id === productVariationId,
        ),
      );
    });
  }
}
