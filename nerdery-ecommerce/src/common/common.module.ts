import { Module } from '@nestjs/common';
import { MailModule } from 'src/mail/mail.module';
import { PrismaService } from 'src/prisma/prisma.service';

import { IdValidatorService } from './services/id-validator/id-validator.service';
import { ProductCalculatedFieldsService } from './services/product-calculations/product-calculated-fields.service';
import { StockReservationManagementService } from './services/stock-reservation-management/stock-reservation-management.service';

@Module({
  imports: [MailModule],
  providers: [
    ProductCalculatedFieldsService,
    IdValidatorService,
    PrismaService,
    StockReservationManagementService,
  ],
  exports: [
    StockReservationManagementService,
    ProductCalculatedFieldsService,
    IdValidatorService,
    PrismaService,
  ],
})
export class CommonModule {}
