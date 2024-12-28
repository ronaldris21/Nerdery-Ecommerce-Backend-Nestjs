import { Module } from '@nestjs/common';
import { CategoriesModule } from 'src/categories/categories.module';
import { CommonModule } from 'src/common/common.module';

import { ProductsResolver } from './products.resolver';
import { ProductsService } from './products.service';

@Module({
  imports: [CategoriesModule, CommonModule],
  providers: [ProductsResolver, ProductsService],
})
export class ProductsModule {}
