import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Query, Args, ResolveField, Parent } from '@nestjs/graphql';
import { ROLES } from 'src/common/constants';
import { StripePaymentsByOrderLoader } from 'src/common/modules/dataloaders/orders/stripe-payments-by-order.loader/stripe-payments-by-order.loader';
import { GetUser } from 'src/modules/auth/decoratos/get-user.decorator';
import { Roles } from 'src/modules/auth/decoratos/roles.decorator';
import { JwtPayloadDto } from 'src/modules/auth/dto/jwtPayload.dto';
import { AccessTokenWithRolesGuard } from 'src/modules/auth/guards/access-token-with-roles.guard';

import { OrderCreatedPayload } from './dto/response/order-created-payload.object';
import { ApprovedStatusPayload } from './entities/approved-status.object';
import { OrderObject } from './entities/order.object';
import { RetryPaymentPayload } from './entities/retry-payment.object';
import { StripePaymentObject } from './entities/stripe-payment.object';
import { OrdersService } from './orders.service';

@Resolver(() => OrderObject)
export class OrdersResolver {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly stripePaymentsByOrderLoader: StripePaymentsByOrderLoader,
  ) {}
  @Query(() => [OrderObject])
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.CLIENT])
  myOrders(@GetUser() user: JwtPayloadDto) {
    return this.ordersService.getOrders(user.userId);
  }

  @Query(() => [OrderObject])
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

  @Query(() => RetryPaymentPayload)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.CLIENT, ROLES.MANAGER])
  retryPayment(
    @Args('orderId', { type: () => String }, ParseUUIDPipe)
    orderId: string,
  ) {
    return this.ordersService.retryPayment(orderId);
  }

  @Mutation(() => OrderCreatedPayload)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.CLIENT])
  createOrder(@GetUser() user: JwtPayloadDto) {
    return this.ordersService.createOrder(user.userId);
  }

  @ResolveField(() => [StripePaymentObject])
  async stripePayments(@Parent() order: OrderObject) {
    return this.stripePaymentsByOrderLoader.load(order.id);
  }
}
