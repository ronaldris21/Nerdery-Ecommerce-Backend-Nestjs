import { Module } from '@nestjs/common';
import { ProductHelperService } from 'src/common/services/product-calculations.service';
import { PrismaService } from 'src/prisma/prisma.service';

import { CategoriesResolver } from './categories.resolver';
import { CategoriesService } from './categories.service';

@Module({
  providers: [CategoriesResolver, CategoriesService, PrismaService, ProductHelperService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
