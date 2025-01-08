import { Module } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { ProductVariationByCartItemLoader } from './cart-items/product-variation-by-cart-item.loader/product-variation-by-cart-item.loader';
import { ProductsBycategoryLoader } from './categories/products-bycategory.loader/products-bycategory.loader';
import { DataloadersService } from './dataloaders.service';
import { ProductVariationByOrderItemLoader } from './order-items/product-variation-by-order-item.loader/product-variation-by-order-item.loader';
import { StripePaymentsByOrderLoader } from './orders/stripe-payments-by-order.loader/stripe-payments-by-order.loader';
import { UserByOrderLoader } from './orders/user-by-order.loader/user-by-order.loader';
import { ProductByProductVariationLoader } from './product-variation/product-by-product-variation.loader/product-by-product-variation.loader';
import { VariationImagesByProductVariationLoader } from './product-variation/variation-images-by-product-variation.loader/variation-images-by-product-variation.loader';
import { CategoryByProductLoader } from './products/category-by-product.loader/category-by-product.loader';
import { VariationImagesByProductLoader } from './products/variation-images-by-product.loader/variation-images-by-product.loader';

@Module({
  providers: [
    StripePaymentsByOrderLoader,
    UserByOrderLoader,
    ProductVariationByOrderItemLoader,
    VariationImagesByProductVariationLoader,
    ProductByProductVariationLoader,
    CategoryByProductLoader,
    VariationImagesByProductLoader,
    ProductVariationByCartItemLoader,
    ProductsBycategoryLoader,
    DataloadersService,
    PrismaService,
  ],
  exports: [
    StripePaymentsByOrderLoader,
    UserByOrderLoader,
    ProductVariationByOrderItemLoader,
    VariationImagesByProductVariationLoader,
    ProductByProductVariationLoader,
    CategoryByProductLoader,
    VariationImagesByProductLoader,
    ProductVariationByCartItemLoader,
    ProductsBycategoryLoader,
    DataloadersService,
  ],
})
export class DataloadersModule {}
