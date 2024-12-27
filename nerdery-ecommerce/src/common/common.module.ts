import { Module } from '@nestjs/common';

import { IdValidatorService } from './services/id-validator/id-validator.service';
import { ProductCalculatedFieldsService } from './services/product-calculations/product-calculated-fields.service';

@Module({
  providers: [ProductCalculatedFieldsService, IdValidatorService],
  exports: [ProductCalculatedFieldsService, IdValidatorService],
})
export class CommonModule {}
