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
import { IdValidatorService } from './common/id-validator/id-validator.service';
import { IdValidatorServiceService } from './common/id-validator.service/id-validator.service.service';
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
    // GraphQLModule.forRootAsync({
    //   driver: ApolloDriver,
    //   useFactory: (config: ConfigService) => {
    //     return {
    //       autoSchemaFile: true,
    //       playground: true,
    //       debug: true,
    //       introspection: true,
    //       // formatError: (error:): GraphQLFormattedError => {
    //       //   const originalError = error.extensions
    //       //     ?.originalError as PrismaClientUnknownRequestError;

    //       //   if (!originalError) {
    //       //     return {
    //       //       message: error.message,
    //       //       code: error.extensions?.code,
    //       //     };
    //       //   }
    //       //   return {
    //       //     message: originalError.message,
    //       //     statusCode: error.extensions?.code,
    //       //   };
    //       // },
    //     };
    //   },
    // }),

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
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService, IdValidatorServiceService, IdValidatorService],
})
export class AppModule {}
