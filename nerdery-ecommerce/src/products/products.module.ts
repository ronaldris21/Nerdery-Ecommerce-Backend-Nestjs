import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsResolver } from './products.resolver';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoriesModule } from 'src/categories/categories.module';
import { ProductHelperService } from 'src/common/services/product-calculations.service';

@Module({
  imports: [CategoriesModule],
  providers: [ProductsResolver, ProductsService, PrismaService, ProductHelperService],

})
export class ProductsModule { }
