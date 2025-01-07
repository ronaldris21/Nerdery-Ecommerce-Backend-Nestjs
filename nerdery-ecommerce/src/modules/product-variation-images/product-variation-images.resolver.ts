import { Resolver } from '@nestjs/graphql';

import { ProductVariationImageObject } from './entities/product-variation-image.entity';
import { ProductVariationImagesService } from './product-variation-images.service';

@Resolver(() => ProductVariationImageObject)
export class ProductVariationImagesResolver {
  constructor(private readonly productVariationImagesService: ProductVariationImagesService) {}
}
