import { UseGuards } from '@nestjs/common';
import { Resolver, Query } from '@nestjs/graphql';
import { GetUser } from 'src/auth/decoratos/get-user.decorator';
import { Roles } from 'src/auth/decoratos/roles.decorator';
import { JwtPayloadDto } from 'src/auth/dto/jwtPayload.dto';
import { AccessTokenWithRolesGuard } from 'src/auth/guards/access-token-with-roles.guard';
import { ROLES } from 'src/common/constants';

import { CartService } from './cart.service';
import { CartObject as CartObject } from './entities/cart.entity';

@Resolver(() => CartObject)
export class CartResolver {
  constructor(private CartService: CartService) {}

  @Query(() => CartObject)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.CLIENT])
  cart(@GetUser() user: JwtPayloadDto) {
    return this.CartService.myCart(user.userId);
  }
}
