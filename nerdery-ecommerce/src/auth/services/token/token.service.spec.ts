import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import ms from 'ms';
import { AuthResponseDto } from 'src/auth/dto/authResponse.dto';
import { JwtConfig } from 'src/common/config/config.interface';
import { PrismaService } from 'src/prisma/prisma.service';

import { RedisService } from '../redis.service';

import { TokenService } from './token.service';

const validUUID = '773a308c-6170-4fb8-9843-144e68cd6da9';
const iat = 123456;
const redisKey = `user:4${validUUID}:iat:${iat}`;

const userValid = {
  id: validUUID,
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  roles: ['CLIENT'],
};

const mockPrismaServiceInit = {
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
};

describe('TokenService', () => {
  let service: TokenService;
  let prismaService: typeof mockPrismaServiceInit;
  let configService: Partial<ConfigService>;

  let jwtService: DeepMocked<JwtService>;
  let redisService: DeepMocked<RedisService>;

  beforeEach(async () => {
    configService = {
      get: jest.fn().mockReturnValue({
        bcryptSaltOrRound: 10,
        expiresIn: '60m',
        refreshIn: '30d',
        jwtAcccessSecret: 'secrettttttttjasal',
        jwtRefreshSecret: 'asjndjksandjkakdnasndalsn',
      } as JwtConfig),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: JwtService, useValue: createMock<JwtService>() },
        { provide: RedisService, useValue: createMock<RedisService>() },
        { provide: ConfigService, useValue: configService },
        { provide: PrismaService, useValue: mockPrismaServiceInit },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    jwtService = module.get(JwtService);
    redisService = module.get(RedisService);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(redisService).toBeDefined();
    expect(configService).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('addAccessTokenToCache', () => {
    beforeEach(() => {
      redisService.set.mockReset();
      redisService.set.mockReset();
    });
    it('should call mockRedisService.set with the correct key', async () => {
      redisService.getAccessTokenKey.mockReturnValue(redisKey);

      await service.addAccessTokenToCache(validUUID, iat, 'fakeAccessToken');

      expect(redisService.getAccessTokenKey).toHaveBeenCalledWith(validUUID, iat);
      expect(redisService.set).toHaveBeenCalledWith(redisKey, 'fakeAccessToken', ms('60m') / 1000);
    });

    it('should throw error mockRedisService.del invalid id', async () => {
      redisService.getAccessTokenKey.mockReturnValue(redisKey);

      await expect(service.removeAccessTokenFromCache('invalidId', iat)).rejects.toThrow();

      expect(redisService.getAccessTokenKey).not.toHaveBeenCalled();
      expect(redisService.del).not.toHaveBeenCalled();
    });
  });

  describe('generateTokensForUser', () => {
    it('should generate accessToken, refreshToken and save them in Redis/DB', async () => {
      jwtService.sign.mockReturnValueOnce('fakeAccessToken');
      jwtService.decode.mockReturnValueOnce({ exp: 1234567 });

      const result: AuthResponseDto = await service.generateTokensForUser(userValid);

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: userValid.id,
          email: userValid.email,
          roles: userValid.roles,
          iat: expect.any(Number),
        }),
        expect.any(Object),
      );
      expect(redisService.set).toHaveBeenCalledTimes(1);
      expect(prismaService.refreshToken.create).toHaveBeenCalledTimes(1);
      expect(prismaService.refreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            refreshToken: expect.any(String),
            userId: userValid.id,
            validUntil: expect.any(Date),
          },
        }),
      );

      expect(result).toEqual(
        expect.objectContaining({
          accessToken: 'fakeAccessToken',
          refreshToken: expect.any(String),
          roles: userValid.roles,
          accessExp: 1234567,
          refreshExp: expect.any(Number),
          iat: expect.any(Number),
        }),
      );
    });

    it('should throw error if user.id or user.email are not present (or user is null)', async () => {
      const invalidUser: any = null;

      await expect(service.generateTokensForUser(invalidUser)).rejects.toThrow();
    });
  });

  describe('removeAccessTokenFromCache', () => {
    beforeEach(() => {
      redisService.set.mockReset();
      redisService.del.mockReset();
    });
    it('should call mockRedisService.del with the correct key', async () => {
      redisService.getAccessTokenKey.mockReturnValue(redisKey);

      await service.removeAccessTokenFromCache(validUUID, iat);
      expect(redisService.getAccessTokenKey).toHaveBeenCalledWith(validUUID, iat);
      expect(redisService.del).toHaveBeenCalledWith(redisKey);
    });

    it('should throw error mockRedisService.del invalid id', async () => {
      redisService.getAccessTokenKey.mockReturnValue(redisKey);

      await expect(service.removeAccessTokenFromCache('invalidId', iat)).rejects.toThrow();

      expect(redisService.getAccessTokenKey).not.toHaveBeenCalled();
      expect(redisService.del).not.toHaveBeenCalled();
    });
  });
  describe('removeAccessTokenFromCacheByUserId', () => {
    beforeEach(() => {
      redisService.removeAllKeysByPattern.mockReset();
    });
    it('should call mockRedisService.removeAllKeysByPattern with the correct pattern', async () => {
      await service.removeAccessTokenFromCacheByUserId(validUUID);
      expect(redisService.removeAllKeysByPattern).toHaveBeenCalledWith(`user:${validUUID}:iat:*`);
    });

    it('should throw error mockRedisService.del invalid id', async () => {
      redisService.getAccessTokenKey.mockReturnValue(redisKey);

      await expect(service.removeAccessTokenFromCache('invalidId', iat)).rejects.toThrow();

      expect(redisService.removeAllKeysByPattern).not.toHaveBeenCalled();
    });
  });
  describe('validateRefreshTokenOrThrow', () => {
    it('should return the token if it exists in DB', async () => {
      const refreshToken = 'token123';
      jest.spyOn(prismaService.refreshToken, 'findUnique').mockResolvedValueOnce({
        id: validUUID,
        refreshToken: refreshToken,
        createdAt: new Date(),
        userId: validUUID,
        validUntil: new Date(),
      });

      const result = await service.validateRefreshTokenOrThrow(refreshToken);

      expect(prismaService.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { refreshToken: refreshToken },
      });
      expect(result).toEqual(expect.objectContaining({ refreshToken: refreshToken }));
    });

    it('should throw UnauthorizedException if the token does not exist', async () => {
      jest.spyOn(prismaService.refreshToken, 'findUnique').mockResolvedValueOnce(null);

      await expect(service.validateRefreshTokenOrThrow('notFoundToken')).rejects.toThrow();
    });
  });
  describe('invalidateRefreshToken', () => {
    beforeEach(() => {
      prismaService.refreshToken.delete = jest.fn();
    });

    it('should delete the token in DB if it exists', async () => {
      jest.spyOn(prismaService.refreshToken, 'delete').mockResolvedValue(null);

      const result = await service.invalidateRefreshToken('someToken');

      expect(prismaService.refreshToken.delete).toHaveBeenCalledWith({
        where: { refreshToken: 'someToken' },
      });
      expect(result).toBe(true);
    });

    it('should not throw error if the token does not exist', async () => {
      jest
        .spyOn(prismaService.refreshToken, 'delete')
        .mockRejectedValueOnce(new Error('Database error'));
      const result = await service.invalidateRefreshToken('missingToken');

      expect(prismaService.refreshToken.delete).toHaveBeenCalledWith({
        where: { refreshToken: 'missingToken' },
      });
      expect(result).toBe(false);
    });
  });
  describe('invalidateAllRefreshTokens', () => {
    beforeEach(() => {
      prismaService.refreshToken.deleteMany = jest.fn();
    });
    it('should delete all refreshTokens for a userId', async () => {
      jest.spyOn(prismaService.refreshToken, 'deleteMany').mockResolvedValue({ count: 2 });

      const result = await service.invalidateAllRefreshTokens(validUUID);

      expect(prismaService.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: validUUID },
      });
      expect(result).toEqual(2);
    });

    it('should throw error for userId invalid', async () => {
      jest.spyOn(prismaService.refreshToken, 'deleteMany').mockResolvedValue({ count: 2 });

      await expect(service.invalidateAllRefreshTokens('user123')).rejects.toThrow();
      expect(prismaService.refreshToken.deleteMany).not.toHaveBeenCalled();
    });
  });

  describe('validateIdUuidOrThrow', () => {
    it('should not throw error for valid id', () => {
      expect(() => service.validateIdUuidOrThrow(validUUID)).not.toThrow();
    });

    it('should throw error for userId invalid', async () => {
      expect(() => service.validateIdUuidOrThrow('xdxd-xdddx-dda')).toThrow();
    });
  });
});
