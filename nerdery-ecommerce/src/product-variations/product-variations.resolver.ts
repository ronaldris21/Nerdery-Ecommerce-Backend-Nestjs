import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ProductVariationsService } from './product-variations.service';
import { ProductVariation } from './entities/product-variation.entity';
import { UpdateProductVariationInput } from './dto/update-product-variation.input';
import { CreateProductVariationInput } from './dto/create-product-variation.input';
import { isUUID, IsUUID } from 'class-validator';
import { ParseUUIDPipe } from '@nestjs/common';

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
}
