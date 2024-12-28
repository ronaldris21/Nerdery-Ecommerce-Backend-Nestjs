import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { GetUser } from 'src/auth/decoratos/get-user.decorator';
import { Roles } from 'src/auth/decoratos/roles.decorator';
import { JwtPayloadDto } from 'src/auth/dto/jwtPayload.dto';
import { AccessTokenWithRolesGuard } from 'src/auth/guards/access-token-with-roles.guard';
import { ROLES } from 'src/common/constants';
import { GenericResponseObject } from 'src/common/dto/generic-response.object';

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

  //TODO: resolved Field and dataloader for productVariation!
}
