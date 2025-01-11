import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Query, Args, ResolveField, Parent } from '@nestjs/graphql';
import { ROLES } from 'src/common/constants';
import { AfterLoadersService } from 'src/common/modules/dataloaders/after-loaders.service';
import { StripePaymentsByOrderLoader } from 'src/common/modules/dataloaders/orders/stripe-payments-by-order.loader/stripe-payments-by-order.loader';
import { UserByOrderLoader } from 'src/common/modules/dataloaders/orders/user-by-order.loader/user-by-order.loader';
import { Roles } from 'src/modules/auth/decoratos/roles.decorator';
import { JwtPayloadDto } from 'src/modules/auth/dto/response/jwtPayload.dto';
import { AccessTokenWithRolesGuard } from 'src/modules/auth/guards/access-token-with-roles.guard';

import { GetAccessToken } from '../auth/decoratos/get-jwtPayload.decorator';
import { GetUser } from '../auth/decoratos/get-user.decorator';

import { ApprovedStatusPayload } from './dto/response/approved-status.object';
import { OrderCreatedPayload } from './dto/response/order-created-payload.object';
import { ClientObject } from './entities/client.object';
import { OrderObject } from './entities/order.object';
import { RetryPaymentPayload } from './entities/retry-payment.object';
import { StripePaymentObject } from './entities/stripe-payment.object';
import { OrdersService } from './orders.service';

@Resolver(() => OrderObject)
export class OrdersResolver {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly stripePaymentsByOrderLoader: StripePaymentsByOrderLoader,
    private readonly userByOrderLoader: UserByOrderLoader,
    private readonly afterLoadersService: AfterLoadersService,
  ) {}

  //TODO: UNIFY THIS TWO QUERIES - myOrders and ordersAsManager
  //Dataloaders has the auth logic, so we can use the same query for both
  @Query(() => [OrderObject])
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.CLIENT])
  myOrders(@GetUser() user: JwtPayloadDto): Promise<OrderObject[]> {
    return this.ordersService.getOrders(user.userId);
  }

  @Query(() => [OrderObject])
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.MANAGER])
  ordersAsManager(
    @Args('userId', { type: () => String }, ParseUUIDPipe) userId: string,
  ): Promise<OrderObject[]> {
    return this.ordersService.getOrders(userId);
  }

  @Query(() => ApprovedStatusPayload)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.CLIENT, ROLES.MANAGER])
  orderPaymentApprovedStatus(
    @Args('orderId', { type: () => String }, ParseUUIDPipe)
    orderId: string,
  ): Promise<ApprovedStatusPayload> {
    return this.ordersService.getPaymentApprovedStatus(orderId);
  }

  @Query(() => RetryPaymentPayload)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.CLIENT, ROLES.MANAGER])
  retryPayment(
    @Args('orderId', { type: () => String }, ParseUUIDPipe)
    orderId: string,
  ): Promise<RetryPaymentPayload> {
    return this.ordersService.retryPayment(orderId);
  }

  @Mutation(() => OrderCreatedPayload)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.CLIENT])
  createOrder(@GetUser() user: JwtPayloadDto): Promise<OrderCreatedPayload> {
    return this.ordersService.createOrder(user.userId);
  }

  @ResolveField(() => [StripePaymentObject])
  async stripePayments(@Parent() order: OrderObject): Promise<StripePaymentObject[]> {
    return this.stripePaymentsByOrderLoader.load(order.id);
  }

  //Accessible only for admins
  @ResolveField(() => ClientObject)
  async client(
    @Parent() order: OrderObject,
    @GetAccessToken() accessToken: string,
  ): Promise<ClientObject> {
    const hasAccess = await this.afterLoadersService.hasAnyRequiredRoles(accessToken, [
      ROLES.MANAGER,
    ]);
    if (hasAccess) return this.userByOrderLoader.load(order.id);
    return null;
  }
}
