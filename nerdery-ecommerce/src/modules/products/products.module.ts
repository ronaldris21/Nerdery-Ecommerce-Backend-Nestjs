import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { DataloadersModule } from 'src/common/modules/dataloaders/dataloaders.module';
import { CategoriesModule } from 'src/modules/categories/categories.module';

import { ProductsResolver } from './products.resolver';
import { ProductsService } from './products.service';

@Module({
  imports: [CategoriesModule, CommonModule, DataloadersModule],
  providers: [ProductsResolver, ProductsService],
})
export class ProductsModule {}
