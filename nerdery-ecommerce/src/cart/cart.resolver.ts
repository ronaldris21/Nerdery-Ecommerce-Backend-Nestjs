import { Resolver } from '@nestjs/graphql';

import { CartService } from './cart.service';
import { CartObject } from './entities/cart.object';

@Resolver(() => CartObject)
export class CartResolver {
  constructor(private readonly cartService: CartService) { }

  // @Query(() => CartObject)
  // cart() {
  //   return this.cartService.myCart();
  // }
}
