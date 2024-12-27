import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { CartItemsModule } from './cart-items/cart-items.module';
import { CategoriesModule } from './categories/categories.module';
import config from './common/config/config';
import { MailModule } from './mail/mail.module';
import { ProductVariationImagesModule } from './product-variation-images/product-variation-images.module';
import { ProductVariationsModule } from './product-variations/product-variations.module';
import { ProductsModule } from './products/products.module';

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
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
      debug: true,
      introspection: true,
    }),
    ProductsModule,
    ProductVariationsModule,
    CategoriesModule,
    ProductVariationImagesModule,
    CartItemsModule,
    CartModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
