import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { ROLES } from 'src/common/constants';
import { VariationImagesByProductVariationLoader } from 'src/common/modules/dataloaders/product-variation/variation-images-by-product-variation.loader/variation-images-by-product-variation.loader';
import { Roles } from 'src/modules/auth/decoratos/roles.decorator';
import { AccessTokenWithRolesGuard } from 'src/modules/auth/guards/access-token-with-roles.guard';

import { ProductVariationImageObject } from '../product-variation-images/entities/product-variation-image.entity';
import { ProductObject } from '../products/entities/product.entity';

import { ProductByProductVariationLoader } from './../../common/modules/dataloaders/product-variation/product-by-product-variation.loader/product-by-product-variation.loader';
import { CreateProductVariationInput } from './dto/request/create-product-variation.input';
import { UpdateProductVariationInput } from './dto/request/update-product-variation.input';
import { ProductVariationObject } from './entities/product-variation.entity';
import { ProductVariationsService } from './product-variations.service';

@Resolver(() => ProductVariationObject)
export class ProductVariationsResolver {
  constructor(
    private readonly productVariationsService: ProductVariationsService,
    private readonly variationImagesByProductVariationLoader: VariationImagesByProductVariationLoader,
    private readonly productByProductVariationLoader: ProductByProductVariationLoader,
  ) {}

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

  @ResolveField(() => [ProductVariationImageObject])
  async variationImages(@Parent() productVariation: ProductVariationObject) {
    return this.variationImagesByProductVariationLoader.load(productVariation.id);
  }

  @ResolveField(() => [ProductObject])
  async product(@Parent() productVariation: ProductVariationObject) {
    return this.productByProductVariationLoader.load(productVariation.id);
  }
}
