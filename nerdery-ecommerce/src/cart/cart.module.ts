import { Module } from '@nestjs/common';
import { CartItemsModule } from 'src/cart-items/cart-items.module';
import { CommonModule } from 'src/common/common.module';

import { CartResolver } from './cart.resolver';
import { CartService } from './cart.service';

@Module({
  providers: [CartResolver, CartService],
  imports: [CartItemsModule, CommonModule],
})
export class CartModule {}
