import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';

import { CartItemsResolver } from './cart-items.resolver';
import { CartItemsService } from './cart-items.service';

@Module({
  providers: [CartItemsResolver, CartItemsService],
  imports: [CommonModule],
})
export class CartItemsModule {}
