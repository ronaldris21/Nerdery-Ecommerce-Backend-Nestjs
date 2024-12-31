import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { ConfigNames, RedisConfig } from 'src/common/config/config.interface';

@Injectable()
export class RedisService {
  private redisClient: Redis;

  constructor(private readonly configService: ConfigService) {
    const redisHost = this.configService.get<RedisConfig>(ConfigNames.redis);
    this.redisClient = new Redis({
      host: redisHost.host,
      port: redisHost.port,

      retryStrategy: (times) => {
        const delay = times * 500;
        console.warn(`Retrying to connect to Redis... Attempt: ${times}, Delay: ${delay}s`);
        return delay;
      },
    });
  }

  getAccessTokenKey(userId: string, iat: number): string {
    return `user:${userId}:iat:${iat}`;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
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

  async removeAllKeysByPattern(pattern: string): Promise<void> {
    const keys = await this.redisClient.keys(pattern);
    if (keys.length > 0) {
      await this.redisClient.del(...keys);
    }
  }
}
