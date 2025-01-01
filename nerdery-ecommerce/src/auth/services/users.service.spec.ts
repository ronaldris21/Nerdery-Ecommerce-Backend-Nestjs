import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a user by ID', async () => {
      const userId = 'a23f8b0e-2aaa-4abe-bd5f-9cf80a87d6d4';
      const expectedUser: User = {
        id: userId,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password',
        createdAt: new Date(),
      };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(expectedUser);

      const result = await service.findById(userId);
      expect(result).toEqual(expectedUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });

  describe('getUserByEmail', () => {
    it('should return a user by email', async () => {
      const email = 'test@example.com';
      const expectedUser: User = {
        id: 'a23f8b0e-2aaa-4abe-bd5f-9cf80a87d6d4',
        email: email,
        firstName: 'Test',
        lastName: 'User',
        password: 'password',
        createdAt: new Date(),
      };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(expectedUser);

      const result = await service.getUserByEmail(email);
      expect(result).toEqual(expectedUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: email },
      });
    });
  });
});
