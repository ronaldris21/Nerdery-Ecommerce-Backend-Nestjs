import { Module } from '@nestjs/common';
import { ProductVariationImagesService } from './product-variation-images.service';
import { ProductVariationImagesResolver } from './product-variation-images.resolver';

@Module({
  providers: [ProductVariationImagesResolver, ProductVariationImagesService],
})
export class ProductVariationImagesModule {}
