import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { ProductCalculatedFieldsService } from 'src/common/services/product-calculations/product-calculated-fields.service';
import { PrismaService } from 'src/prisma/prisma.service';

import { ProductVariationsResolver } from './product-variations.resolver';
import { ProductVariationsService } from './product-variations.service';

@Module({
  imports: [CommonModule],
  providers: [
    ProductVariationsResolver,
    ProductVariationsService,
    PrismaService,
    ProductCalculatedFieldsService,
  ],
})
export class ProductVariationsModule {}
