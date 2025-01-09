import { Module } from '@nestjs/common';
import { DataloadersModule } from 'src/common/modules/dataloaders/dataloaders.module';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { ProductCalculatedFieldsService } from 'src/common/services/product-calculations/product-calculated-fields.service';

import { CategoriesResolver } from './categories.resolver';
import { CategoriesService } from './categories.service';

@Module({
  imports: [DataloadersModule],
  providers: [CategoriesResolver, CategoriesService, PrismaService, ProductCalculatedFieldsService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
