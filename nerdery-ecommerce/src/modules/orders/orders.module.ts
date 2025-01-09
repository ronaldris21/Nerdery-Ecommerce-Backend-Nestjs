import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from 'src/common/common.module';
import { DataloadersModule } from 'src/common/modules/dataloaders/dataloaders.module';
import { StripeModule } from 'src/modules/stripe/stripe.module';

import { CartModule } from '../cart/cart.module';

import { OrderItemsResolver } from './orders-items.resolver';
import { OrdersResolver } from './orders.resolver';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    DataloadersModule,
    CommonModule,
    ConfigModule,
    CartModule,
    StripeModule,
    StripeModule.forRootAsync(),
  ],
  providers: [OrdersResolver, OrdersService, OrderItemsResolver],
  exports: [OrdersService],
})
export class OrdersModule {}
