import { join } from 'path';

import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';

import { HttpExceptionFilter } from './exception-filters/http-exception/http-exception.filter';
import { PrismaClientExceptionFilter } from './exception-filters/prisma-exception.filter/prisma-exception.filter.filter';

@Module({
  imports: [
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/auto-generated-schemas.graphql'),
      playground: true,
      debug: true,
      introspection: true,
      formatError: (error) => ({
        //This is made for class validator errors are represented in a array
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
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter,
    },
  ],
})
export class GraphqlModule {}
