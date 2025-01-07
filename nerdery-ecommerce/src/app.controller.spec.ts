import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppController - uptime robots health checkpoints', () => {
  let appController: AppController;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              count: jest.fn().mockResolvedValueOnce(1),
            },
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    prismaService = app.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  describe('/hello GET', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('/db GET', () => {
    it('check db get', async () => {
      jest.spyOn(prismaService.user, 'count').mockResolvedValueOnce(1);
      const result = await appController.dbUsersCount();
      expect(result).toBe(1);
    });
  });
});
