import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { CartItemsModule } from './cart-items/cart-items.module';
import { CategoriesModule } from './categories/categories.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CommonModule } from './common/common.module';
import config from './common/config/config';
import { GraphqlModule } from './graphql/graphql.module';
import { ImagesModule } from './images/images.module';
import { MailModule } from './mail/mail.module';
import { OrdersModule } from './orders/orders.module';
import { ProductLikesModule } from './product-likes/product-likes.module';
import { ProductVariationImagesModule } from './product-variation-images/product-variation-images.module';
import { ProductVariationsModule } from './product-variations/product-variations.module';
import { ProductsModule } from './products/products.module';
import { StripeModule } from './stripe/stripe.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      // If a variable is found in multiple files, the first one takes precedence.
      envFilePath: ['.env.development', '.env'],
      isGlobal: true,
      load: [config],
    }),
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
  providers: [AppService],
})
export class AppModule {}
