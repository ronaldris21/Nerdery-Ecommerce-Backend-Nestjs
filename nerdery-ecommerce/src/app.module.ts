import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { CloudinaryModule } from './common/modules/cloudinary/cloudinary.module';
import { ConfigEnvModule } from './common/modules/config-env/config-env.module';
import { GraphqlModule } from './common/modules/graphql/graphql.module';
import { MailModule } from './common/modules/mail/mail.module';
import { PrismaModule } from './common/modules/prisma/prisma.module';
import { PrismaService } from './common/modules/prisma/prisma.service';
import { RateLimitModule } from './common/modules/rate-limit/rate-limit.module';
import { AuthModule } from './modules/auth/auth.module';
import { CartModule } from './modules/cart/cart.module';
import { CartItemsModule } from './modules/cart-items/cart-items.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ImagesModule } from './modules/images/images.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ProductLikesModule } from './modules/product-likes/product-likes.module';
import { ProductVariationImagesModule } from './modules/product-variation-images/product-variation-images.module';
import { ProductVariationsModule } from './modules/product-variations/product-variations.module';
import { ProductsModule } from './modules/products/products.module';
import { StripeModule } from './modules/stripe/stripe.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    ConfigEnvModule,
    RateLimitModule,
    MailModule,
    ProductsModule,
    ProductVariationsModule,
    CategoriesModule,
    ProductVariationImagesModule,
    CartItemsModule,
    CartModule,
    CommonModule,
    GraphqlModule,
    ProductLikesModule,
    OrdersModule,
    StripeModule,
    CloudinaryModule,
    ImagesModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
