import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import {
  Prisma,
  Product,
  ProductLike,
  ProductVariation,
  User,
  VariationImage,
} from '@prisma/client';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import {
  validUUID1,
  validUUID2,
  validUUID3,
  validUUID4,
  validUUID9,
} from 'src/common/testing-mocks/helper-data';

import { MailService } from './mail.service';

const mockPrismaService = {
  productLike: {
    findMany: jest.fn(),
  },
  orderItem: {
    findMany: jest.fn(),
  },
  user: {
    findFirst: jest.fn(),
  },
  productVariation: {
    findFirst: jest.fn(),
  },
};
describe('MailService', () => {
  let service: MailService;
  let prismaService: typeof mockPrismaService;
  let mailerService: DeepMocked<MailerService>;
  let logger: Logger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: MailerService, useValue: createMock<MailerService>() },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    mailerService = module.get(MailerService);
    prismaService = module.get(PrismaService);

    logger = (service as any).logger;
    jest.spyOn(logger, 'log').mockImplementation(() => {});
    jest.spyOn(logger, 'error').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(mailerService).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(logger).toBeDefined();
  });

  const mockUser: User = {
    id: '5e61ad24-20f7-477a-9e6d-1312f50d2b59',
    email: 'ronaldrios@ravn.co',
    firstName: 'Ronald',
    lastName: 'Rios',
    createdAt: new Date(),
    password: 'password',
  };

  describe('sendPasswordResetEmail', () => {
    const resetToken = validUUID9;
    const resetUrl = 'https://example.com/reset?token=' + resetToken;

    it('should send a password reset email successfully', async () => {
      mailerService.sendMail.mockResolvedValueOnce(undefined);

      await expect(
        service.sendPasswordResetEmail(mockUser, resetUrl, resetToken),
      ).resolves.not.toThrow();

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: mockUser.email,
        subject: 'Reset Your Password',
        template: './reset-password',
        context: {
          name: mockUser.firstName,
          resetUrl,
          resetToken,
        },
      });
    });

    it('should throw an error if MailerService fails to send the email', async () => {
      mailerService.sendMail.mockRejectedValueOnce(new Error('SMTP Error'));

      await expect(service.sendPasswordResetEmail(mockUser, resetUrl, resetToken)).rejects.toThrow(
        'SMTP Error',
      );

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: mockUser.email,
        subject: 'Reset Your Password',
        template: './reset-password',
        context: {
          name: mockUser.firstName,
          resetUrl,
          resetToken,
        },
      });
    });
  });

  describe('sendPasswordChangedNotification', () => {
    it('should send a password changed notification successfully and log the action', async () => {
      mailerService.sendMail.mockResolvedValueOnce(undefined);

      await expect(service.sendPasswordChangedNotification(mockUser)).resolves.not.toThrow();

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: mockUser.email,
        subject: 'Your password was changed!',
        template: './password-changed',
        context: {
          name: mockUser.firstName,
        },
      });

      expect(logger.log).toHaveBeenCalledWith('Password change notification sent');
    });

    it('should throw an error if MailerService fails to send the notification', async () => {
      mailerService.sendMail.mockRejectedValueOnce(new Error('SMTP Error'));

      await expect(service.sendPasswordChangedNotification(mockUser)).rejects.toThrow('SMTP Error');

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: mockUser.email,
        subject: 'Your password was changed!',
        template: './password-changed',
        context: {
          name: mockUser.firstName,
        },
      });
      expect(logger.log).not.toHaveBeenCalledWith('Password change notification sent');
    });
  });

  describe('sendLowStockEmail', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mailerService.sendMail.mockImplementation(() => new Promise((resolve) => resolve(1)));
    });

    const userIdWhoBought = validUUID1;
    const userIdLikesOnly = validUUID2;
    const productVariationId = validUUID3;
    const productId = validUUID4;

    const mockUserToSendEmail: User = {
      id: userIdLikesOnly,
      email: 'retejada@alu.ucam.edu',
      firstName: 'Xavier',
      lastName: 'Kai',
      password: '$2b$10$wDdPDcT.F3WGEOyWL.asjdkamñld,aslñd,/HaC',
      createdAt: new Date(),
    };
    const mockLikes: ProductLike[] = [
      { userId: userIdLikesOnly, productId: productId, likedAt: new Date() },
      { userId: userIdWhoBought, productId: productId, likedAt: new Date() },
    ];

    const mockOrderItems = [
      {
        id: '868fb86b-ca42-4d9c-b5d0-200b1b0ec605',
        orderId: 'f21d1eaa-ee07-4b0a-83cb-eba0b29957fb',
        productVariationId: productVariationId,
        unitPrice: 78.69,
        quantity: 1,
        subTotal: 78.69,
        discount: 11.8,
        total: 66.89,
        order: {
          userId: userIdWhoBought,
        },
      },
      {
        id: 'd3b50fa2-f655-43f3-8349-b89c401f6340',
        orderId: 'a11ef13c-5495-4dcf-98da-32b5fd8f1057',
        productVariationId: productVariationId,
        unitPrice: 78.69,
        quantity: 1,
        subTotal: 78.69,
        discount: 11.8,
        total: 66.89,
        order: {
          userId: '2e30d6d3-2986-4d3d-827d-5771ad836fba',
        },
      },
      {
        id: '9fe467cc-9228-4633-b706-4be8c57aa996',
        orderId: 'adbf82cb-370a-4304-a449-77e8d2a19d35',
        productVariationId: productVariationId,
        unitPrice: 78.69,
        quantity: 1,
        subTotal: 78.69,
        discount: 11.8,
        total: 66.89,
        order: {
          userId: '2e30d6d3-2986-4d3d-827d-5771ad836fba',
        },
      },
      {
        id: '4ec2d881-5a6d-49f2-8679-500fa771a58e',
        orderId: '38e576bf-9856-43a5-846c-aab9978fcd12',
        productVariationId: productVariationId,
        unitPrice: 78.69,
        quantity: 1,
        subTotal: 78.69,
        discount: 11.8,
        total: 66.89,
        order: {
          userId: '2e30d6d3-2986-4d3d-827d-5771ad836fba',
        },
      },
      {
        id: '3bda7cd8-4f1f-4d0c-8dd7-e9359d355f72',
        orderId: '49f7de8c-b823-4141-87de-124bffcd4763',
        productVariationId: productVariationId,
        unitPrice: 78.69,
        quantity: 1,
        subTotal: 78.69,
        discount: 11.8,
        total: 66.89,
        order: {
          userId: '2e30d6d3-2986-4d3d-827d-5771ad836fba',
        },
      },
      {
        id: '9634fe63-a8ca-44a0-a948-8db93076291b',
        orderId: 'afbe93c9-9720-4c99-8d1e-275f13e7e310',
        productVariationId: productVariationId,
        unitPrice: 78.69,
        quantity: 1,
        subTotal: 78.69,
        discount: 11.8,
        total: 66.89,
        order: {
          userId: '2e30d6d3-2986-4d3d-827d-5771ad836fba',
        },
      },
    ];

    const mockProductVariation: ProductVariation = {
      id: productVariationId,
      productId: productId,
      price: new Prisma.Decimal('78.69'),
      discount: new Prisma.Decimal('15'),
      discountType: 'PERCENTAGE',
      size: 'XL',
      color: 'indigo',
      stock: 1,
      stockRefilledAt: new Date('2025-01-06T19:42:12.356Z'),
      isEnabled: true,
      isDeleted: false,
    };

    const mockProduct: Product = {
      id: productId,
      name: 'Generic Granite Bike',
      gender: 'FEMALE',
      thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cb/Monkey_D_Luffy.png',
      categoryId: 'aad62167-235d-4d1d-b4fd-f687b020acd0',
      description: 'Professional-grade Sausages perfect for thorny training and recreational use',
      isEnabled: true,
      isDeleted: false,
      likesCount: 0,
      minPrice: new Prisma.Decimal('73.65'),
      maxPrice: new Prisma.Decimal('79.29'),
      createdAt: new Date('2025-01-03T22:58:00.265Z'),
      updatedAt: new Date('2025-01-03T22:58:00.756Z'),
    };

    const mockProductVariationFullDetails: ProductVariation & {
      product: Product;
      variationImages: VariationImage[];
    } = {
      ...mockProductVariation,
      product: mockProduct,
      variationImages: [
        {
          id: 'f62c5a35-8c07-4e09-8afa-e96b28c0060d',
          productVariationId: '30b248c1-ad1d-4b5b-b2a2-c01467ca8b06',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cb/Monkey_D_Luffy.png',
        },
        {
          id: '26f2e717-7ea2-44e2-9a57-5f25c0914223',
          productVariationId: '30b248c1-ad1d-4b5b-b2a2-c01467ca8b06',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cb/Monkey_D_Luffy.png',
        },
        {
          id: '0e25cc72-eae7-40ef-aa32-34c2f02f1faf',
          productVariationId: '30b248c1-ad1d-4b5b-b2a2-c01467ca8b06',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cb/Monkey_D_Luffy.png',
        },
      ],
    };

    it('should send a low stock email to the first valid user who liked but has not bought', async () => {
      prismaService.productLike.findMany.mockResolvedValueOnce(mockLikes);
      prismaService.orderItem.findMany.mockResolvedValueOnce(mockOrderItems);
      prismaService.user.findFirst.mockResolvedValueOnce(mockUserToSendEmail);
      prismaService.productVariation.findFirst.mockResolvedValueOnce(
        mockProductVariationFullDetails,
      );
      mailerService.sendMail.mockResolvedValueOnce(undefined);

      await service.sendLowStockEmail(mockProductVariation);

      expect(prismaService.productLike.findMany).toHaveBeenCalledWith({
        where: { productId: mockProductVariation.productId },
        orderBy: { likedAt: 'desc' },
      });

      expect(prismaService.orderItem.findMany).toHaveBeenCalledWith({
        where: {
          productVariationId: mockProductVariation.id,
        },
        include: { order: { select: { userId: true } } },
      });

      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { id: userIdLikesOnly },
      });

      expect(prismaService.productVariation.findFirst).toHaveBeenCalledWith({
        where: { id: mockProductVariation.id },
        include: { product: true, variationImages: true },
      });

      expect(mockUserToSendEmail.id).toBe(userIdLikesOnly);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: mockUserToSendEmail.email,
        subject: `Low Stock: ${mockProduct.name}!`,
        template: './low-stock-email',
        context: {
          user: mockUserToSendEmail,
          productVariation: mockProductVariationFullDetails,
        },
      });

      expect(logger.log).toHaveBeenCalledWith(`Email sent to: ${mockUserToSendEmail.email}`);
      expect(logger.log).toHaveBeenCalledWith(`Product name: ${mockProduct.name}`);
      expect(logger.log).toHaveBeenCalledWith(`Product ID: ${mockProduct.id}`);
      expect(logger.log).toHaveBeenCalledWith(`Product Variation ID: ${mockProductVariation.id}`);
      expect(logger.log).toHaveBeenCalledWith(
        `Product Variation Stock: ${mockProductVariation.stock}`,
      );
    });

    it('should not send an email if there is no valid user to notify - no likes on the product', async () => {
      prismaService.productLike.findMany.mockResolvedValueOnce([]);
      prismaService.orderItem.findMany.mockResolvedValueOnce(mockOrderItems);

      await service.sendLowStockEmail(mockProductVariation);

      expect(prismaService.user.findFirst).not.toHaveBeenCalled();
      expect(prismaService.productVariation.findFirst).not.toHaveBeenCalled();
      expect(mailerService.sendMail).not.toHaveBeenCalled();
    });

    it('should handle errors when mailerService.sendMail fails', async () => {
      prismaService.productLike.findMany.mockResolvedValueOnce(mockLikes);
      prismaService.orderItem.findMany.mockResolvedValueOnce(mockOrderItems);
      prismaService.user.findFirst.mockResolvedValueOnce(mockUserToSendEmail);
      prismaService.productVariation.findFirst.mockResolvedValueOnce(
        mockProductVariationFullDetails,
      );
      mailerService.sendMail.mockRejectedValueOnce(new Error('Mailer error'));

      await expect(service.sendLowStockEmail(mockProductVariation)).rejects.toThrow();

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: mockUserToSendEmail.email,
        subject: `Low Stock: ${mockProduct.name}!`,
        template: './low-stock-email',
        context: {
          user: mockUserToSendEmail,
          productVariation: mockProductVariationFullDetails,
        },
      });
    });
  });

  describe('sendLowStockEmailInitProcess', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.useRealTimers();
      jest.spyOn(service, 'sendLowStockEmail').mockResolvedValue();
      jest.spyOn(logger, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.clearAllMocks();
      jest.useRealTimers();
    });

    const productVariationId = validUUID3;
    const productId = validUUID4;

    const mockProductVariation: ProductVariation = {
      id: productVariationId,
      productId: productId,
      price: new Prisma.Decimal('78.69'),
      discount: new Prisma.Decimal('15'),
      discountType: 'PERCENTAGE',
      size: 'XL',
      color: 'indigo',
      stock: 1,
      stockRefilledAt: new Date('2025-01-06T19:42:12.356Z'),
      isEnabled: true,
      isDeleted: false,
    };

    it('should log an error if sendLowStockEmail throws an error', async () => {
      const mockError = new Error('Error sending email');
      jest.spyOn(service, 'sendLowStockEmail').mockRejectedValue(mockError);

      jest.useFakeTimers(); //Fake setTimeout
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      service.sendLowStockEmailInitProcess(mockProductVariation);
      jest.runAllTimers(); // Fast-forward all timers
      await Promise.resolve(); // Allow any pending promises to resolve

      // Assert that sendLowStockEmail was called
      expect(service.sendLowStockEmail).toHaveBeenCalledWith(mockProductVariation);
      expect(logger.error).toHaveBeenCalledWith(
        `Error sending low stock email id: ${mockProductVariation.id}`,
        mockError,
      );
      expect(logger.error).toHaveBeenCalledTimes(1);
    });

    it('Init background proccess for low stock email successfully', async () => {
      jest.spyOn(service, 'sendLowStockEmail').mockResolvedValueOnce(undefined);

      jest.useFakeTimers();
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      service.sendLowStockEmail(mockProductVariation);
      jest.runAllTimers();
      await Promise.resolve();

      expect(service.sendLowStockEmail).toHaveBeenCalledWith(mockProductVariation);
      expect(service.sendLowStockEmail).toHaveBeenCalledTimes(1);
    });
  });
});
