import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ProductVariation, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MailService {
  logger = new Logger('MailService');

  constructor(
    private mailerService: MailerService,
    private readonly prismaService: PrismaService,
  ) {}

  // OUT OF SCOPE!
  // I DECIDED TO REMOVE THEM DUE TO limited SMPT service quota. Faster development and manual testing.
  // async sendWelcomeEmail(to: string, name: string): Promise<void> {
  //   try {
  //     await this.mailerService.sendMail({
  //       to,
  //       subject: 'Welcome to Our Service',
  //       template: './welcome',
  //       context: {
  //         name,
  //       },
  //     });
  //   } catch (error) {
  //     debug(error);
  //   }
  // }

  // async sendUserConfirmation(user: JwtPayloadDto, token: string) {
  //   const url = `example.com/auth/confirm?token=${token}`;

  //   await this.mailerService.sendMail({
  //     to: user.email,
  //     subject: 'Welcome to Nice App! Confirm your Email',
  //     template: './confirmation',
  //     context: {
  //       name: user.firstName,
  //       url,
  //     },
  //   });

  //   return { message: 'Confirmation email sent' };
  // }

  async sendPasswordResetEmail(user: User, resetUrl: string, resetToken: string): Promise<void> {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Reset Your Password',
      template: './reset-password',
      context: {
        name: user.firstName,
        resetUrl,
        resetToken,
      },
    });
  }

  async sendPasswordChangedNotification(user: User): Promise<void> {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Your password was changed!',
      template: './password-changed',
      context: {
        name: user.firstName,
      },
    });
    this.logger.log('Password change notification sent');
  }

  async sendLowStockEmailInitProcess(prodVariation: ProductVariation) {
    setTimeout(async () => {
      try {
        await this.sendLowStockEmail(prodVariation);
      } catch (error) {
        this.logger.error('Error sending low stock email', error);
      }
    }, 1);
  }

  async sendLowStockEmail(prodVariation: ProductVariation) {
    this.logger.log('SENDING LOW STOCK EMAIL FOR PRODUCT VARIATION ID: ' + prodVariation.id);

    //last liked and not bought user:
    const likes = await this.prismaService.productLike.findMany({
      where: {
        productId: prodVariation.productId,
      },
      orderBy: {
        likedAt: 'desc',
      },
    });

    //Check on orderItems the productVariationId! Include the order to get the id of the user. Check if the user is not in the list of likes.
    const orderItems = await this.prismaService.orderItem.findMany({
      where: {
        productVariationId: prodVariation.id,
      },
      include: {
        order: {
          select: {
            userId: true,
          },
        },
      },
    });

    //Create a map to make a direct search, if null then the user is not in the list of likes.
    const usersWhoBought = orderItems.map((orderItem) => orderItem.order.userId);

    let firstValidUserId = null;
    for (const like of likes) {
      if (!usersWhoBought.includes(like.userId)) {
        firstValidUserId = like.userId;
        break;
      }
    }

    if (!firstValidUserId) {
      return;
    }

    const userToSendEmail = await this.prismaService.user.findFirst({
      where: {
        id: firstValidUserId,
      },
    });

    const productVariationFullDetails = await this.prismaService.productVariation.findFirst({
      where: {
        id: prodVariation.id,
      },
      include: {
        product: true,
        variationImages: true,
      },
    });

    const templateData = {
      user: userToSendEmail,
      productVariation: productVariationFullDetails,
    };

    await this.mailerService.sendMail({
      to: userToSendEmail.email,
      subject: `Low Stock: ${productVariationFullDetails.product.name}!`,
      template: './low-stock-email',
      context: templateData,
    });

    this.logger.log(`Email sent to: ${userToSendEmail.email}`);
    this.logger.log(`Product name: ${productVariationFullDetails.product.name}`);
    this.logger.log(`Product ID: ${productVariationFullDetails.product.id}`);
    this.logger.log(`Product Variation ID: ${productVariationFullDetails.id}`);
    this.logger.log(`Product Variation Stock: ${productVariationFullDetails.stock}`);
  }
}
