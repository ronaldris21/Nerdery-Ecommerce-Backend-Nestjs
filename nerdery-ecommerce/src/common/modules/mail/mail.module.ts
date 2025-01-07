import { join } from 'path';

import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as Handlebars from 'handlebars'; // Importa Handlebars
import { PrismaService } from 'src/common/modules/prisma/prisma.service';

import { MailService } from './mail.service';

//NOTE CHECK THE nest.cli.json file for the correct path:
// "sourceRoot": "src",
//   "compilerOptions": {
//     "assets": [{ "include": "mail/templates/**/*.hbs", "outDir": "dist/src/" }],
//     "watchAssets": true
//   }

Handlebars.registerHelper('eq', (arg1, arg2) => arg1 === arg2);

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: 587,
        secure: false, // Use true for 465, false for other ports
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
      defaults: {
        from: `"No Reply" <${process.env.MAIL_FROM}>`,
      },
      template: {
        dir: join(__dirname, '/templates'),

        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService, PrismaService],
  exports: [MailService],
})
export class MailModule {}
