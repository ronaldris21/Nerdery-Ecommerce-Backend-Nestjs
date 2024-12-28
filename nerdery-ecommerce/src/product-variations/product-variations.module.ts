import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';

import { ProductVariationsResolver } from './product-variations.resolver';
import { ProductVariationsService } from './product-variations.service';

@Module({
  imports: [CommonModule],
  providers: [ProductVariationsResolver, ProductVariationsService],
})
export class ProductVariationsModule {}
