import { Module } from '@nestjs/common';
import { ProductVariationsService } from './product-variations.service';
import { ProductVariationsResolver } from './product-variations.resolver';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductHelperService } from 'src/common/services/product-calculations.service';

@Module({
  providers: [ProductVariationsResolver, ProductVariationsService, PrismaService, ProductHelperService],
})
export class ProductVariationsModule { }
