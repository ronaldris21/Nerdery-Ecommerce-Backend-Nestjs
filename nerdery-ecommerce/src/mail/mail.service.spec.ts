import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '@prisma/client';
import { validUUID9 } from 'src/common/testing-mocks/helper-data';
import { PrismaService } from 'src/prisma/prisma.service';

import { MailService } from './mail.service';

describe('MailService', () => {
  let service: MailService;
  let mailerService: DeepMocked<MailerService>;
  let prismaService: DeepMocked<PrismaService>;
  let logger: Logger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: MailerService, useValue: createMock<MailerService>() },
        { provide: PrismaService, useValue: createMock<PrismaService>() },
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
});
