import { Module } from '@nestjs/common';
import { CartItemsModule } from 'src/cart-items/cart-items.module';

import { CartResolver } from './cart.resolver';
import { CartService } from './cart.service';

@Module({
  providers: [CartResolver, CartService],
  imports: [CartItemsModule],
})
export class CartModule {}
