import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

import { UsersService } from './users.service';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
  },
  userRole: {
    findMany: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
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

    it('should return null', async () => {
      const userId = 'a23f8b0e-2aaa-4abe-bd5f-9cf80a87d6d4';
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      const result = await service.findById(userId);

      expect(result).toEqual(null);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });

  describe('getUserByEmail', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
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

    it('should return null', async () => {
      const email = 'notfound@example.com';

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      const result = await service.getUserByEmail(email);
      expect(result).toEqual(null);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: email },
      });
    });
  });

  describe('getUserRoles', () => {
    it('should return user roles', async () => {
      const userId = 'a23f8b0e-2aaa-4abe-bd5f-9cf80a87d6d4';
      const userRoles = [{ role: { name: 'admin' } }, { role: { name: 'user' } }];
      jest.spyOn(prismaService.userRole, 'findMany').mockResolvedValue(userRoles as any);

      const result = await service.getUserRoles(userId);

      expect(result).toEqual(['admin', 'user']);
      expect(prismaService.userRole.findMany).toHaveBeenCalledWith({
        where: { userId: userId },
        include: { role: true },
      });
    });
    it('should return an empty array if user does not exist', async () => {
      const userId = 'a23f8b0e-2aaa-4abe-bd5f-9cf80a87d6d4';
      const userRoles = [];

      jest.spyOn(prismaService.userRole, 'findMany').mockResolvedValue(userRoles);

      const result = await service.getUserRoles(userId);
      expect(result).toEqual([]);
      expect(prismaService.userRole.findMany).toHaveBeenCalledWith({
        where: { userId: userId },
        include: { role: true },
      });
    });
  });
});
