import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigNames, JwtConfig } from 'src/common/modules/config-env/config.interface';

import { JwtPayloadDto } from '../dto/response/jwtPayload.dto';
import { RedisService } from '../services/redis/redis.service';
import { UsersService } from '../services/users/users.service';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly usersService: UsersService,
    private redisService: RedisService,
    readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<JwtConfig>(ConfigNames.jwt).jwtAcccessSecret,
    });
  }

  async validate(payload: JwtPayloadDto): Promise<JwtPayloadDto> {
    const user = await this.usersService.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedException('Invalid access token');
    }

    //TODO: Validate using Redis Cache
    const redisKey = this.redisService.getAccessTokenKey(payload.userId, payload.iat);
    const isCached = await this.redisService.get(redisKey);

    if (!isCached) {
      throw new UnauthorizedException('Access token is not in cache or has been revoked');
    }

    return payload;
  }
}
