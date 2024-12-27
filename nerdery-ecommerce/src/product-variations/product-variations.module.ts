import { Module } from '@nestjs/common';
import { ProductHelperService } from 'src/common/services/product-calculations.service';
import { PrismaService } from 'src/prisma/prisma.service';

import { ProductVariationsResolver } from './product-variations.resolver';
import { ProductVariationsService } from './product-variations.service';

@Module({
  providers: [
    ProductVariationsResolver,
    ProductVariationsService,
    PrismaService,
    ProductHelperService,
  ],
})
export class ProductVariationsModule {}
