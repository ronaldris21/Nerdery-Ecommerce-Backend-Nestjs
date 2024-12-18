import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordService } from './services/password.service';
import { UsersService } from './services/users.service';
import { AccessTokenStrategy } from './strategies/accessToken.strategy .ts';
import { ConfigNames, JwtConfig } from 'src/common/config/config.interface';
import { RedisService } from './services/redis.service';

@Module({
  imports: [
    ConfigModule,
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
  ],
  exports: [AccessTokenStrategy],
})
export class AuthModule {}
