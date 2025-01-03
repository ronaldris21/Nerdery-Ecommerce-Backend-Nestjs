import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { RedisConfig } from 'src/common/config/config.interface';

import { RedisService } from './redis.service';

const mockRedisClient = {
  set: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  keys: jest.fn(),
};

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => mockRedisClient);
});

describe('RedisService', () => {
  let redisService: RedisService;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn().mockReturnValue({
        host: 'localhost',
        port: 6379,
      } as RedisConfig),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    redisService = module.get<RedisService>(RedisService);
    mockRedisClient.keys.mockReset();
    mockRedisClient.del.mockReset();
    mockRedisClient.exists.mockReset();
    mockRedisClient.set.mockReset();
    mockRedisClient.get.mockReset();
  });

  it('should be defined', () => {
    expect(redisService).toBeDefined();
    expect(mockRedisClient).toBeDefined();
    expect(mockConfigService).toBeDefined();
  });

  describe('getAccessTokenKey', () => {
    it('should generate the correct access token key', () => {
      const userId = 'user123';
      const iat = 1678900000;
      const expectedKey = `user:${userId}:iat:${iat}`;
      expect(redisService.getAccessTokenKey(userId, iat)).toBe(expectedKey);
    });

    it('should not generate the correct access token key: userId undefined', () => {
      const userId = undefined;
      const iat = 1678900000;
      expect(() => redisService.getAccessTokenKey(userId, iat)).toThrow();
    });

    it('should not generate the correct access token key: userId null', () => {
      const userId = null;
      const iat = 1678900000;
      expect(() => redisService.getAccessTokenKey(userId, iat)).toThrow();
    });
    it('should not generate the correct access token key: userId empty', () => {
      const userId = '';
      const iat = 1678900000;
      expect(() => redisService.getAccessTokenKey(userId, iat)).toThrow();
    });

    it('should not generate the correct access token key: iat negative', () => {
      const userId = 'user123';
      const iat = -12315;
      expect(() => redisService.getAccessTokenKey(userId, iat)).toThrow();
    });

    it('should not generate the correct access token key: iat zero', () => {
      const userId = 'user123';
      const iat = 0;
      expect(() => redisService.getAccessTokenKey(userId, iat)).toThrow();
    });
  });

  describe('set', () => {
    it('should call Redis set with key, value, and TTL', async () => {
      const key = 'testKey';
      const value = 'testValue';
      const ttl = 60;

      await redisService.set(key, value, ttl);

      expect(mockRedisClient.set).toHaveBeenCalledWith(key, value, 'EX', ttl);
    });

    it('should call Redis set with key and value without TTL', async () => {
      const key = 'testKey';
      const value = 'testValue';

      await redisService.set(key, value, null);

      expect(mockRedisClient.set).toHaveBeenCalledWith(key, value);
    });
  });

  describe('get', () => {
    it('should call Redis get with the correct key', async () => {
      const key = 'testKey';
      mockRedisClient.get.mockResolvedValueOnce('testValue');

      const result = await redisService.get(key);

      expect(mockRedisClient.get).toHaveBeenCalledWith(key);
      expect(result).toBe('testValue');
    });
  });

  describe('del', () => {
    it('should call Redis del with the correct key', async () => {
      const key = 'testKey';

      await redisService.del(key);

      expect(mockRedisClient.del).toHaveBeenCalledWith(key);
    });
  });

  describe('exists', () => {
    it('should call Redis exists with the correct key', async () => {
      const key = 'testKey';
      mockRedisClient.exists.mockResolvedValueOnce(1);

      const result = await redisService.exists(key);

      expect(mockRedisClient.exists).toHaveBeenCalledWith(key);
      expect(result).toBe(1);
    });
  });

  describe('removeAllKeysByPattern', () => {
    //NOTE: THIS IS EXTREMELY IMPORTANT
    //beforeEach applies to all tests in the describe block
    beforeEach(async () => {
      mockRedisClient.keys.mockReset();
      mockRedisClient.del.mockReset();
    });

    it('should throw error if pattern', async () => {
      const pattern = 'nonexistent*';

      const keys = ['test1', 'test2'];
      mockRedisClient.keys.mockResolvedValue(keys);
      mockRedisClient.del.mockResolvedValue(0);

      await expect(
        async () => await redisService.removeAllKeysByPattern(pattern),
      ).rejects.toThrow();

      expect(mockRedisClient.keys).not.toHaveBeenCalled();
      expect(mockRedisClient.del).not.toHaveBeenCalled();
    });

    it('should throw error if pattern: null', async () => {
      const pattern = null;

      await expect(
        async () => await redisService.removeAllKeysByPattern(pattern),
      ).rejects.toThrow();

      expect(mockRedisClient.keys).not.toHaveBeenCalled();
      expect(mockRedisClient.del).not.toHaveBeenCalled();
    });

    it('should throw error if pattern: undefined', async () => {
      const pattern = undefined;

      await expect(
        async () => await redisService.removeAllKeysByPattern(pattern),
      ).rejects.toThrow();

      expect(mockRedisClient.keys).not.toHaveBeenCalled();
      expect(mockRedisClient.del).not.toHaveBeenCalled();
    });

    it('should throw error if pattern: empty', async () => {
      const pattern = '';

      await expect(
        async () => await redisService.removeAllKeysByPattern(pattern),
      ).rejects.toThrow();

      expect(mockRedisClient.keys).not.toHaveBeenCalled();
      expect(mockRedisClient.del).not.toHaveBeenCalled();
    });

    it('should not call del if pattern deletes all *', async () => {
      const pattern = '*';

      await expect(
        async () => await redisService.removeAllKeysByPattern(pattern),
      ).rejects.toThrow();

      expect(mockRedisClient.keys).not.toHaveBeenCalled();
      expect(mockRedisClient.del).not.toHaveBeenCalled();
    });

    it('should throw error if pattern user:*', async () => {
      const pattern = 'user:*';

      await expect(
        async () => await redisService.removeAllKeysByPattern(pattern),
      ).rejects.toThrow();

      expect(mockRedisClient.keys).not.toHaveBeenCalled();
      expect(mockRedisClient.del).not.toHaveBeenCalled();
    });
    it('should throw error if pattern user:4as*', async () => {
      const pattern = 'user:4as*';
      await expect(
        async () => await redisService.removeAllKeysByPattern(pattern),
      ).rejects.toThrow();

      expect(mockRedisClient.keys).not.toHaveBeenCalled();
      expect(mockRedisClient.del).not.toHaveBeenCalled();
    });

    it('should not del keys by pattern if userId not a UUID', async () => {
      const pattern = 'user:123:iat:*';
      await expect(
        async () => await redisService.removeAllKeysByPattern(pattern),
      ).rejects.toThrow();

      expect(mockRedisClient.keys).not.toHaveBeenCalled();
      expect(mockRedisClient.del).not.toHaveBeenCalled();
    });

    it('should find keys by pattern and return an array', async () => {
      const pattern = 'user:e3bb2540-725c-4d66-98ec-39a32ef4e457:iat:*';
      const keys = ['test1', 'test2'];
      mockRedisClient.keys.mockResolvedValue(keys);
      mockRedisClient.del.mockResolvedValue(2);

      const result = await redisService.removeAllKeysByPattern(pattern);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(keys);
      expect(mockRedisClient.del).toHaveBeenCalledTimes(1);
    });

    it('should find keys by pattern and delete them', async () => {
      const pattern = 'user:e3bb2540-725c-4d66-98ec-39a32ef4e457:iat:*';
      const keys = ['test1', 'test2'];
      mockRedisClient.keys.mockResolvedValue(keys);
      mockRedisClient.del.mockResolvedValue(2);

      await redisService.removeAllKeysByPattern(pattern);

      expect(mockRedisClient.keys).toHaveBeenLastCalledWith(pattern);
      expect(mockRedisClient.del).toHaveBeenLastCalledWith(...keys);
    });

    it('should not call del if no keys', async () => {
      const pattern = 'user:e3bb2540-725c-4d66-98ec-39a32ef4e457:iat:*';

      mockRedisClient.keys.mockResolvedValue([]);
      mockRedisClient.del.mockResolvedValue(0);

      const result = await redisService.removeAllKeysByPattern(pattern);

      expect(mockRedisClient.keys).toHaveBeenLastCalledWith(pattern);
      expect(mockRedisClient.del).toHaveBeenCalledTimes(0); // Ensure `del` is NOT called
      expect(result.length).toEqual(0);
    });
  });
});
