import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
