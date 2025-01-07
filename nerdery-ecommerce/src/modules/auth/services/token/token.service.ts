import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import ms from 'ms';
import { validateStringUUID } from 'src/common/helpers/utils';
import { ConfigNames, JwtConfig } from 'src/common/modules/config-env/config.interface';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { AuthResponseDto } from 'src/modules/auth/dto/authResponse.dto';
import { JwtPayloadDto } from 'src/modules/auth/dto/jwtPayload.dto';
import { v4 as uuid4 } from 'uuid';

import { RedisService } from '../redis/redis.service';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async generateTokensForUser(user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles: string[];
  }): Promise<AuthResponseDto> {
    const { id, email, firstName, lastName, roles } = user;
    const jwtConfig = this.configService.get<JwtConfig>(ConfigNames.jwt);

    // "Issue at" in seconds
    const iat = Math.floor(Date.now() / 1000);

    const payload: Omit<JwtPayloadDto, 'exp'> = {
      userId: id,
      email,
      roles,
      iat,
      firstName,
      lastName,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: jwtConfig.expiresIn,
      secret: jwtConfig.jwtAcccessSecret,
    });

    await this.addAccessTokenToCache(id, iat, accessToken);

    const refreshToken = uuid4();
    const refreshTokenExp = new Date(Date.now() + ms(jwtConfig.refreshIn));

    await this.prismaService.refreshToken.create({
      data: {
        refreshToken,
        userId: id,
        validUntil: refreshTokenExp,
      },
    });

    return {
      accessToken,
      refreshToken,
      roles,
      accessExp: this.jwtService.decode(accessToken)['exp'],
      refreshExp: Math.floor(refreshTokenExp.getTime() / 1000),
      iat,
    };
  }

  // REDIS OPERATIONS

  async addAccessTokenToCache(userId: string, iat: number, accessToken: string): Promise<void> {
    this.validateIdUuidOrThrow(userId);
    const redisKey = this.redisService.getAccessTokenKey(userId, iat);
    const expiresIn = this.configService.get<JwtConfig>(ConfigNames.jwt).expiresIn;

    await this.redisService.set(redisKey, accessToken, ms(expiresIn) / 1000);
  }

  async removeAccessTokenFromCache(userId: string, iat: number): Promise<void> {
    this.validateIdUuidOrThrow(userId);
    const redisKey = this.redisService.getAccessTokenKey(userId, iat);
    await this.redisService.del(redisKey);
  }

  async removeAccessTokenFromCacheByUserId(userId: string): Promise<void> {
    this.validateIdUuidOrThrow(userId);
    await this.redisService.removeAllKeysByPattern(`user:${userId}:iat:*`);
  }

  // DATABASE OPERATIONS

  async validateRefreshTokenOrThrow(refreshToken: string) {
    const token = await this.prismaService.refreshToken.findUnique({
      where: { refreshToken },
    });
    if (!token) {
      throw new NotFoundException('Invalid refresh token');
    }
    return token;
  }
  async invalidateRefreshToken(refreshToken: string): Promise<boolean> {
    try {
      await this.prismaService.refreshToken.delete({ where: { refreshToken } });
      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
    } catch (e) {
      // No need to throw an error if the token no existe
    }
    return false;
  }

  async invalidateAllRefreshTokens(userId: string): Promise<number> {
    this.validateIdUuidOrThrow(userId);
    const count = await this.prismaService.refreshToken.deleteMany({
      where: { userId },
    });
    return count.count;
  }

  validateIdUuidOrThrow(id: string): void {
    if (validateStringUUID(id) === false) {
      throw new BadRequestException('Invalid user id in Token service');
    }
  }
}
