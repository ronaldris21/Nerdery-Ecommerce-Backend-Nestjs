import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import config from './common/config/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { ApolloDriver } from '@nestjs/apollo';
import { ProductVariationsModule } from './product-variations/product-variations.module';
import { ProductVariationImagesModule } from './product-variation-images/product-variation-images.module';
import { ProductCalculationsService } from './common/services/product-calculations.service';

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

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
