import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { PrismaService } from 'src/prisma/prisma.service';

import { CartItemsResolver } from './cart-items.resolver';
import { CartItemsService } from './cart-items.service';

@Module({
  providers: [CartItemsResolver, CartItemsService, PrismaService],
  imports: [CommonModule],
})
export class CartItemsModule {}
