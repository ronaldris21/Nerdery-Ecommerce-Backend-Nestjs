import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { GetUser } from 'src/auth/decoratos/get-user.decorator';
import { Roles } from 'src/auth/decoratos/roles.decorator';
import { JwtPayloadDto } from 'src/auth/dto/jwtPayload.dto';
import { AccessTokenWithRolesGuard } from 'src/auth/guards/access-token-with-roles.guard';
import { ROLES } from 'src/common/constants';

import { ApprovedStatusPayload } from './entities/approved-status.object';
import { ClientOrderObject } from './entities/client-order.object';
import { OrdersService } from './orders.service';

// Importar los tipos de tu schema GraphQL o DTOs generados:

@Resolver(() => ClientOrderObject)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Query(() => ApprovedStatusPayload)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.CLIENT])
  orderPaymentApprovedStatus(
    @Args('orderId', { type: () => String }, ParseUUIDPipe)
    orderId: string,
  ) {
    console.log(orderId);
    return this.ordersService.getPaymentApprovedStatus(orderId);
  }

  @Mutation(() => ClientOrderObject)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.CLIENT])
  createOrder(@GetUser() user: JwtPayloadDto) {
    return this.ordersService.createOrder(user.userId);
  }
}
