import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ProductVariationImagesService } from './product-variation-images.service';
import { ProductVariationImage } from './entities/product-variation-image.entity';
import { CreateProductVariationImageInput } from './dto/create-product-variation-image.input';
import { UpdateProductVariationImageInput } from './dto/update-product-variation-image.input';

@Resolver(() => ProductVariationImage)
export class ProductVariationImagesResolver {
  constructor(private readonly productVariationImagesService: ProductVariationImagesService) { }


}
