import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { PrismaService } from 'src/prisma/prisma.service';

import { CartResolver } from './cart.resolver';
import { CartService } from './cart.service';

@Module({
  providers: [CartResolver, CartService, PrismaService],
  imports: [CommonModule],
})
export class CartModule {}
