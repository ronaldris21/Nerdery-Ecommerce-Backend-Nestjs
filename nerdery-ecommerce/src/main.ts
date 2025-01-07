import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/modules/graphql/exception-filters/http-exception/http-exception.filter';
import { PrismaClientExceptionFilter } from './common/modules/graphql/exception-filters/prisma-exception.filter/prisma-exception.filter.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          imgSrc: [`'self'`, 'data:', 'apollo-server-landing-page.cdn.apollographql.com'],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
          manifestSrc: [`'self'`, 'apollo-server-landing-page.cdn.apollographql.com'],
          frameSrc: [`'self'`, 'sandbox.embed.apollographql.com'],
        },
      },
    }),
  );

  app.enableCors({
    origin: '*', //I have no fronted yet, so I'm allowing all origins TODO: Change this in the future with real domain
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: '*',
    credentials: true,
  });

  // Enable raw body parsing for webhooks
  app.use(
    bodyParser.json({
      verify: (req, res, buf) => {
        (req as any).rawBody = buf;
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Sport Clothing Ecommerce API')
    .setDescription(
      `API Guide to help you use it. Mainly covers auth and general endpoints, as endpoints for managers or customers only. API documentation for managing sport items, clothing, and orders.

**This system has different roles:**

You can access to certain data about categories, products and its variations without an account. However, some endpoints are restricted to specific roles. A user can have multiple roles.

- **Client** is the role for customers. It's the default role you get access after signup.

- **Manager** is the role for people in charge of the ecommerce. You can not get this role by any endpoint. The role is manually set on the database.

**Multiple roles considerations:**

There are endpoints available for multiple roles (e.g. /orders). Whenever a user has more than one role and make a request on a multi-role endpoint, the system assumes you are accessing the endpoint as Client.

In a multi-role endpoint you have to specified the role in the header in order to avoid making requests as client. Check GET /orders for more reference.
      `,
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transformOptions: {
        exposeDefaultValues: true,
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter(), new PrismaClientExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
