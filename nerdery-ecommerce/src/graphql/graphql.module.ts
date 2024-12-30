import { join } from 'path';

import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

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
})
export class GraphqlModule {}
