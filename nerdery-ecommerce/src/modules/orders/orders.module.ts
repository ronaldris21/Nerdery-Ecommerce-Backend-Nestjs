import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from 'src/common/common.module';
import { StripeModule } from 'src/modules/stripe/stripe.module';

import { CartModule } from '../cart/cart.module';

import { OrdersResolver } from './orders.resolver';
import { OrdersService } from './orders.service';

@Module({
  imports: [CommonModule, ConfigModule, CartModule, StripeModule, StripeModule.forRootAsync()],
  providers: [OrdersResolver, OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
