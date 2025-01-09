import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ROLES } from 'src/common/constants';
import { GenericResponseObject } from 'src/common/data/dto/generic-response.object';
import { GetUser } from 'src/modules/auth/decoratos/get-user.decorator';
import { Roles } from 'src/modules/auth/decoratos/roles.decorator';
import { JwtPayloadDto } from 'src/modules/auth/dto/jwtPayload.dto';
import { AccessTokenWithRolesGuard } from 'src/modules/auth/guards/access-token-with-roles.guard';

import { CartItemsService } from './cart-items.service';
import { CartItemInput } from './dto/cart-item.input';
import { CartItemObject } from './entities/cart-item.object';

@Resolver(() => CartItemObject)
export class CartItemsResolver {
  constructor(private readonly cartItemsService: CartItemsService) {}

  @Mutation(() => CartItemObject)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.CLIENT])
  createOrUpdateCartItem(
    @Args('cartItemInput') cartItemInput: CartItemInput,
    @GetUser() user: JwtPayloadDto,
  ) {
    return this.cartItemsService.createOrUpdate(cartItemInput, user.userId);
  }

  @Mutation(() => GenericResponseObject)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.CLIENT])
  deleteCartItem(
    @Args('productVariationId', { type: () => String }, ParseUUIDPipe)
    productVariationId: string,
    @GetUser() user: JwtPayloadDto,
  ) {
    return this.cartItemsService.delete(user.userId, productVariationId);
  }
}
