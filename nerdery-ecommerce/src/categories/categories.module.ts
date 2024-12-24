import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesResolver } from './categories.resolver';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductCalculationsService } from 'src/common/services/product-calculations.service';

@Module({
  providers: [CategoriesResolver, CategoriesService, PrismaService, ProductCalculationsService],
  exports: [CategoriesService],
})
export class CategoriesModule { }
