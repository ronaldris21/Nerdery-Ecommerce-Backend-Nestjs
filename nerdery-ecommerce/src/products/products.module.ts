import { Module } from '@nestjs/common';
import { CategoriesModule } from 'src/categories/categories.module';
import { ProductHelperService } from 'src/common/services/product-calculations.service';
import { PrismaService } from 'src/prisma/prisma.service';

import { ProductsResolver } from './products.resolver';
import { ProductsService } from './products.service';

@Module({
  imports: [CategoriesModule],
  providers: [ProductsResolver, ProductsService, PrismaService, ProductHelperService],
})
export class ProductsModule {}
