import { Module } from '@nestjs/common';
import { CategoriesModule } from 'src/categories/categories.module';
import { CommonModule } from 'src/common/common.module';
import { ProductCalculatedFieldsService } from 'src/common/services/product-calculations/product-calculated-fields.service';
import { PrismaService } from 'src/prisma/prisma.service';

import { ProductsResolver } from './products.resolver';
import { ProductsService } from './products.service';

@Module({
  imports: [CategoriesModule, CommonModule],
  providers: [ProductsResolver, ProductsService, PrismaService, ProductCalculatedFieldsService],
})
export class ProductsModule {}
