import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service';

import { AfterLoadersService } from './after-loaders.service';
import { ProductsBycategoryLoader } from './categories/products-bycategory.loader/products-by-category.loader';
import { DataloadersService } from './dataloaders.service';
import { ProductVariationByOrderItemLoader } from './order-items/product-variation-by-order-item.loader/product-variation-by-order-item.loader';
import { StripePaymentsByOrderLoader } from './orders/stripe-payments-by-order.loader/stripe-payments-by-order.loader';
import { UserByOrderLoader } from './orders/user-by-order.loader/user-by-order.loader';
import { ProductByProductVariationLoader } from './product-variation/product-by-product-variation.loader/product-by-product-variation.loader';
import { VariationImagesByProductVariationLoader } from './product-variation/variation-images-by-product-variation.loader/variation-images-by-product-variation.loader';
import { CategoryByProductLoader } from './products/category-by-product.loader/category-by-product.loader';
import { ProductVariationByProductLoader } from './products/product-variation-by-product.loader/product-variation-by-product.loader';

@Module({
  providers: [
    JwtService,
    StripePaymentsByOrderLoader,
    UserByOrderLoader,
    ProductVariationByOrderItemLoader,
    VariationImagesByProductVariationLoader,
    ProductByProductVariationLoader,
    CategoryByProductLoader,
    ProductsBycategoryLoader,
    DataloadersService,
    PrismaService,
    AfterLoadersService,
    ProductVariationByProductLoader,
  ],
  exports: [
    StripePaymentsByOrderLoader,
    UserByOrderLoader,
    ProductVariationByOrderItemLoader,
    VariationImagesByProductVariationLoader,
    ProductByProductVariationLoader,
    CategoryByProductLoader,
    ProductsBycategoryLoader,
    DataloadersService,
    AfterLoadersService,
    ProductVariationByProductLoader,
  ],
})
export class DataloadersModule {}
