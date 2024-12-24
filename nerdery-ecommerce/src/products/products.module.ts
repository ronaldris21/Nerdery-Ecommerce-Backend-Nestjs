import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsResolver } from './products.resolver';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  imports: [CategoriesModule],
  providers: [ProductsResolver, ProductsService, PrismaService],

})
export class ProductsModule { }
