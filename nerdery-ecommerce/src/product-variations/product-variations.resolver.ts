import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ProductVariationsService } from './product-variations.service';
import { ProductVariation } from './entities/product-variation.entity';
import { UpdateProductVariationInput } from './dto/update-product-variation.input';
import { CreateProductVariationInput } from './dto/create-product-variation.input';
import { isUUID, IsUUID } from 'class-validator';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { AccessTokenWithRolesGuard } from 'src/auth/guards/access-token-with-roles.guard';
import { Roles } from 'src/auth/decoratos/roles.decorator';
import { ROLES } from 'src/common/constants';

@Resolver(() => ProductVariation)
export class ProductVariationsResolver {
  constructor(private readonly productVariationsService: ProductVariationsService) { }

  @Query(() => [ProductVariation])
  productVariations(@Args('productId', { type: () => String }, ParseUUIDPipe) productId: string) {
    return this.productVariationsService.findAll(productId);
  }

  @Query(() => ProductVariation, { nullable: true })
  productVariationById(@Args('id', { type: () => String }, ParseUUIDPipe) id: string) {
    return this.productVariationsService.findOne(id);
  }

  @Mutation(() => ProductVariation)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.MANAGER])
  createProductVariation(
    @Args('input') input: CreateProductVariationInput,
  ) {
    console.log('\n\nCreateProductVariationInput:', input);
    return this.productVariationsService.create(input);
  }

  @Mutation(() => ProductVariation)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.MANAGER])
  updateProductVariation(
    @Args('input') input: UpdateProductVariationInput,
  ) {
    return this.productVariationsService.update(input);
  }

  @Mutation(() => ProductVariation)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.MANAGER])
  toggleProductVariation(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
    @Args('isEnabled') isEnabled: boolean
  ) {
    return this.productVariationsService.toggleIsEnabled(id, isEnabled);
  }

  @Mutation(() => ProductVariation)
  @UseGuards(AccessTokenWithRolesGuard)
  @Roles([ROLES.MANAGER])
  deleteProductVariation(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
  ) {
    return this.productVariationsService.delete(id);
  }

}
