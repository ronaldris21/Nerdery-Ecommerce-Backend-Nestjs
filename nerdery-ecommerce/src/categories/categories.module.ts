import { Module } from '@nestjs/common';
import { ProductCalculatedFieldsService } from 'src/common/services/product-calculations/product-calculated-fields.service';
import { PrismaService } from 'src/prisma/prisma.service';

import { CategoriesResolver } from './categories.resolver';
import { CategoriesService } from './categories.service';

@Module({
  providers: [CategoriesResolver, CategoriesService, PrismaService, ProductCalculatedFieldsService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
