import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Roles } from 'src/auth/decoratos/roles.decorator';
import { AccessTokenWithRolesGuard } from 'src/auth/guards/access-token-with-roles.guard';
import { ROLES } from 'src/common/constants';

import { CreateProductVariationInput } from './dto/create-product-variation.input';
import { UpdateProductVariationInput } from './dto/update-product-variation.input';
import { ProductVariationObject } from './entities/product-variation.entity';
import { ProductVariationsService } from './product-variations.service';

@Resolver(() => ProductVariationObject)
export class ProductVariationsResolver {
  constructor(private readonly productVariationsService: ProductVariationsService) {}

  @Query(() => [ProductVariationObject])
  productVariations(@Args('productId', { type: () => String }, ParseUUIDPipe) productId: string) {
    return this.productVariationsService.findAll(productId);
  }

  @Query(() => ProductVariationObject, { nullable: true })
  productVariationById(@Args('id', { type: () => String }, ParseUUIDPipe) id: string) {
    return this.productVariationsService.findOne(id);
  }

  @Mutation(() => ProductVariationObject)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.MANAGER])
  createProductVariation(@Args('input') input: CreateProductVariationInput) {
    return this.productVariationsService.create(input);
  }

  @Mutation(() => ProductVariationObject)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.MANAGER])
  updateProductVariation(@Args('input') input: UpdateProductVariationInput) {
    return this.productVariationsService.update(input);
  }

  @Mutation(() => ProductVariationObject)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.MANAGER])
  toggleProductVariation(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
    @Args('isEnabled') isEnabled: boolean,
  ) {
    return this.productVariationsService.toggleIsEnabled(id, isEnabled);
  }

  @Mutation(() => ProductVariationObject)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.MANAGER])
  deleteProductVariation(@Args('id', { type: () => String }, ParseUUIDPipe) id: string) {
    return this.productVariationsService.delete(id);
  }
}
