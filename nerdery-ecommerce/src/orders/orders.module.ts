import { Module } from '@nestjs/common';
import { CartModule } from 'src/cart/cart.module';
// Ajusta la ruta si tu cartService está en otro lugar
import { CommonModule } from 'src/common/common.module';

import { OrdersResolver } from './orders.resolver';
import { OrdersService } from './orders.service';

// Importar tus otros servicios y el PrismaService

@Module({
  imports: [CommonModule, CartModule],
  providers: [OrdersResolver, OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
