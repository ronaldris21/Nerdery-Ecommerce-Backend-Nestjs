import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';

import { CartResolver } from './cart.resolver';
import { CartService } from './cart.service';

@Module({
  providers: [CartResolver, CartService],
  imports: [CommonModule],
  exports: [CartService],
})
export class CartModule {}
