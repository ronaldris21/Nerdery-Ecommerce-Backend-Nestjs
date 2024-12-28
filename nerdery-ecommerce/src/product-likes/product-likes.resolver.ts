import { UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { GetUser } from 'src/auth/decoratos/get-user.decorator';
import { Roles } from 'src/auth/decoratos/roles.decorator';
import { JwtPayloadDto } from 'src/auth/dto/jwtPayload.dto';
import { AccessTokenWithRolesGuard } from 'src/auth/guards/access-token-with-roles.guard';
import { ROLES } from 'src/common/constants';
import { ProductObject } from 'src/products/entities/product.entity';

import { ProductLikesService } from './product-likes.service';

@Resolver(() => ProductObject)
export class ProductLikesResolver {
  constructor(private readonly productLikesService: ProductLikesService) {}

  @Mutation(() => ProductObject)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.CLIENT])
  likeProduct(
    @Args('productId', { type: () => String }, ParseUUIDPipe)
    productId: string,
    @GetUser() user: JwtPayloadDto,
  ) {
    return this.productLikesService.like(user.userId, productId);
  }

  @Mutation(() => ProductObject)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.CLIENT])
  dislikeProduct(
    @Args('productId', { type: () => String }, ParseUUIDPipe)
    productId: string,
    @GetUser() user: JwtPayloadDto,
  ) {
    return this.productLikesService.dislike(user.userId, productId);
  }
}
