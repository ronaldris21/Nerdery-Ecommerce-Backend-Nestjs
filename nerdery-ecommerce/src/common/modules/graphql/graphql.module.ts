import { join } from 'path';

import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { DateTimeScalar } from 'src/common/modules/graphql/scalars/date-time.scalar';
import { DecimalScalar } from 'src/common/modules/graphql/scalars/decimal.scalar';

@Module({
  imports: [
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/auto-generated-schemas.graphql'),
      playground: true,
      debug: true,
      introspection: true,
      context: ({ req, res }) => ({ req, res }), // Pass req and res explicitly for rate limit feature

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
  providers: [DecimalScalar, DateTimeScalar],
})
export class GraphqlModule {}
