import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigNames, JwtConfig } from 'src/common/modules/config-env/config.interface';
import { MailModule } from 'src/common/modules/mail/mail.module';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordService } from './services/password/password.service';
import { RedisService } from './services/redis/redis.service';
import { TokenService } from './services/token/token.service';
import { UsersService } from './services/users/users.service';
import { AccessTokenStrategy } from './strategies/access-token.strategy';

@Module({
  imports: [
    ConfigModule,
    MailModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const jwtConfig = configService.get<JwtConfig>(ConfigNames.jwt);
        return {
          secret: jwtConfig.jwtAcccessSecret,
          signOptions: { expiresIn: jwtConfig.expiresIn },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    UsersService,
    AccessTokenStrategy,
    PrismaService,
    RedisService,
    TokenService,
  ],
  exports: [AccessTokenStrategy, JwtService],
})
export class AuthModule {}
