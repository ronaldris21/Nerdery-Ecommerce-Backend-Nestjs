import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { GetUser } from 'src/auth/decoratos/get-user.decorator';
import { Roles } from 'src/auth/decoratos/roles.decorator';
import { JwtPayloadDto } from 'src/auth/dto/jwtPayload.dto';
import { AccessTokenWithRolesGuard } from 'src/auth/guards/access-token-with-roles.guard';
import { ROLES } from 'src/common/constants';

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

  // @Mutation(() => CartItemInput)
  // removeCartItem(@Args('id', { type: () => String }) id: string) {
  //   return this.cartItemsService.remove(id, id);
  // }
}
