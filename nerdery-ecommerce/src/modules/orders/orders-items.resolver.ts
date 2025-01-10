import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { ProductVariation } from '@prisma/client';
import { ProductVariationByOrderItemLoader } from 'src/common/modules/dataloaders/order-items/product-variation-by-order-item.loader/product-variation-by-order-item.loader';

import { ProductVariationObject } from '../product-variations/entities/product-variation.entity';

import { OrderItemObject } from './entities/order-item.object';

@Resolver(() => OrderItemObject)
export class OrderItemsResolver {
  constructor(
    private readonly productVariationByOrderItemLoader: ProductVariationByOrderItemLoader,
  ) {}

  @ResolveField(() => ProductVariationObject)
  async productVariation(@Parent() orderItem: OrderItemObject): Promise<ProductVariation> {
    return this.productVariationByOrderItemLoader.load(orderItem.productVariationId);
  }
}
