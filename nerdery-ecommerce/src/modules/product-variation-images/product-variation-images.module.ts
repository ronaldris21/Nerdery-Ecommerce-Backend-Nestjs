import { Module } from '@nestjs/common';

import { ProductVariationImagesResolver } from './product-variation-images.resolver';
import { ProductVariationImagesService } from './product-variation-images.service';

@Module({
  providers: [ProductVariationImagesResolver, ProductVariationImagesService],
})
export class ProductVariationImagesModule {}
