import { join } from 'path';

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
import { CommonModule } from './common/common.module';
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
      autoSchemaFile: join(process.cwd(), 'src/auto-generated-schemas.graphql'),
      playground: true,
      debug: true,
      introspection: true,
      formatError: (error) => ({
        message: Array.isArray(error.extensions['originalError']?.['message'])
          ? (error.extensions['originalError']?.['message'] as string[]).join(', ')
          : error.message,
        path: error.path,
        locations: error.locations,
        extensions: {
          code: error.extensions['code'],
        },
      }),
    }),
    ProductsModule,
    ProductVariationsModule,
    CategoriesModule,
    ProductVariationImagesModule,
    CartItemsModule,
    CartModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
