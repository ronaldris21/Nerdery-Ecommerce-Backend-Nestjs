import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { IdValidatorService } from './services/id-validator/id-validator.service';
import { ProductCalculatedFieldsService } from './services/product-calculations/product-calculated-fields.service';

@Module({
  providers: [ProductCalculatedFieldsService, IdValidatorService, PrismaService],
  exports: [ProductCalculatedFieldsService, IdValidatorService, PrismaService],
})
export class CommonModule {}
