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

  @Query(() => [ClientOrderObject])
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.CLIENT])
  myOrders(@GetUser() user: JwtPayloadDto) {
    return this.ordersService.getOrders(user.userId);
  }

  @Query(() => [ClientOrderObject])
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.MANAGER])
  ordersAsManager(@Args('userId', { type: () => String }, ParseUUIDPipe) userId: string) {
    return this.ordersService.getOrders(userId, true);
  }

  @Query(() => ApprovedStatusPayload)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.CLIENT, ROLES.MANAGER])
  orderPaymentApprovedStatus(
    @Args('orderId', { type: () => String }, ParseUUIDPipe)
    orderId: string,
  ) {
    return this.ordersService.getPaymentApprovedStatus(orderId);
  }

  @Mutation(() => ClientOrderObject)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.CLIENT])
  createOrder(@GetUser() user: JwtPayloadDto) {
    return this.ordersService.createOrder(user.userId);
  }
}
