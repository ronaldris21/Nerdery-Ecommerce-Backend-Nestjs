import { Module } from '@nestjs/common';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { ProductCalculatedFieldsService } from 'src/common/services/product-calculations/product-calculated-fields.service';

import { CategoriesResolver } from './categories.resolver';
import { CategoriesService } from './categories.service';

@Module({
  providers: [CategoriesResolver, CategoriesService, PrismaService, ProductCalculatedFieldsService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
