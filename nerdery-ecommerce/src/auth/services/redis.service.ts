import {
  Injectable,
  Logger,
  NotAcceptableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { ConfigNames, RedisConfig } from 'src/common/config/config.interface';

@Injectable()
export class RedisService {
  private redisClient: Redis;
  private logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {
    const redisHost = this.configService.get<RedisConfig>(ConfigNames.redis);
    this.redisClient = new Redis({
      host: redisHost.host,
      port: redisHost.port,

      retryStrategy: (times) => {
        const delay = 3000;
        this.logger.error(`Retrying to connect to Redis... Attempt: ${times}, Delay: ${delay}s`);
        return delay;
      },
    });
  }

  getAccessTokenKey(userId: string, iat: number): string {
    if (!userId || !iat || isNaN(iat) || iat <= 0) {
      throw new UnprocessableEntityException(
        'userId and iat are required to generate the access token key',
      );
    }
    return `user:${userId}:iat:${iat}`;
  }

  async set(key: string, value: string, ttlSeconds: number = 900): Promise<void> {
    if (ttlSeconds) {
      await this.redisClient.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async exists(key: string): Promise<number> {
    return this.redisClient.exists(key);
  }

  async removeAllKeysByPattern(pattern: string): Promise<string[]> {
    if (!pattern || pattern.length === 0) {
      throw new Error('Pattern is required to delete keys from cache');
    }

    const allowedPattern = /^user:[0-9a-fA-F-]{36}:iat:(\d+|\*)$/;
    if (!allowedPattern.test(pattern)) {
      throw new NotAcceptableException(
        'Pattern format is not allowed. Formate allowed: user:{userId} or user:{userId}:iat:*',
      );
    }

    const keys = await this.redisClient.keys(pattern);
    if (keys && keys.length > 0) {
      await this.redisClient.del(...keys);
    }
    return keys || [];
  }
}
