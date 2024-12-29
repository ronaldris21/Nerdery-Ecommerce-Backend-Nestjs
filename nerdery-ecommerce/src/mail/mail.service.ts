import { debug } from 'console';

import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '@prisma/client';
import { JwtPayloadDto } from 'src/auth/dto/jwtPayload.dto';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to, // recipient email
        subject: 'Welcome to Our Service',
        template: './welcome', // template file name (without .hbs extension)
        context: {
          name, // pass variables to the template
        },
      });
    } catch (error) {
      debug(error);
    }
  }

  async sendPasswordResetEmail(user: User, resetUrl: string, resetToken: string): Promise<void> {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Reset Your Password',
      template: './reset-password', // Handlebars file without extension
      context: {
        name: user.firstName,
        resetUrl,
        resetToken,
      },
    });
  }

  async sendUserConfirmation(user: JwtPayloadDto, token: string) {
    const url = `example.com/auth/confirm?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Welcome to Nice App! Confirm your Email',
      template: './confirmation', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        name: user.firstName,
        url,
      },
    });

    return { message: 'Confirmation email sent' };
  }

  async sendLowStockEmail(data: any) {
    setTimeout(() => console.log('\n\n EMAIL SENT: ' + JSON.stringify(data)), 5000);
  }
}
