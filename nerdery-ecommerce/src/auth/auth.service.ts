import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken, User } from '@prisma/client';
import ms from 'ms';
import {
  ConfigNames,
  FrontentConfig,
  JwtConfig,
} from 'src/common/config/config.interface';
import { clientRoleName } from 'src/common/constants';
import { GenericResponse } from 'src/common/dto/generic.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuid4 } from 'uuid';

import { AuthResponseDto } from './dto/authResponse.dto';
import { JwtPayloadDto } from './dto/jwtPayload.dto';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';
import { PasswordService } from './services/password.service';
import { UsersService } from './services/users.service';
import { RedisService } from './services/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
    private jwtService: JwtService,
    private redisService: RedisService,
    private configService: ConfigService,
    private userService: UsersService,
  ) { }

  async getRefreshToken(refreshToken: string): Promise<RefreshToken> {
    return this.prisma.refreshToken.findUnique({
      where: {
        refreshToken: refreshToken,
      },
    });
  }

  async addAccessTokenToCache(userId: string, iat: number, accessToken: string): Promise<void> {
    const redisKey = this.redisService.getAccessTokenKey(userId, iat);
    // console.log('CREATED: redisKey', redisKey);
    const expiresIn = this.configService.get<JwtConfig>(ConfigNames.jwt).expiresIn;
    await this.redisService.set(redisKey, accessToken, ms(expiresIn) / 1000); // expiration in seconds
  }

  async removeAccessTokenFromCache(userId: string, iat: number): Promise<void> {
    const redisKey = this.redisService.getAccessTokenKey(userId, iat);
    const result = await this.redisService.del(redisKey);
    // console.log(`DELETE: rediskey ${redisKey}: ${result}`);
  }

  async invalidateRefreshToken(refreshToken: string): Promise<void> {
    try {
      await this.prisma.refreshToken.delete({
        where: {
          refreshToken: refreshToken,
        },
      });

    } catch (e) {
      // No need to throw an error if the token is not found
    }
  }

  async invalidateAllRefreshTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId: userId,
      },
    });
  }

  async generateNewTokens(user: Omit<User,"createdAt"|"password">): Promise<AuthResponseDto> {
    // Generate JWT - Access and Refresh Token
    const jwtConfig = this.configService.get<JwtConfig>(ConfigNames.jwt);

    // Access Token
    const iat: number = Math.floor(Date.now() / 1000); // issue at time in seconds
    const accessPayload: Omit<JwtPayloadDto, 'exp'> = {
      userId: user.id,
      email: user.email,
      iat: iat,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    const accessToken = this.jwtService.sign(accessPayload, {
      expiresIn: jwtConfig.expiresIn,
      secret: jwtConfig.jwtAcccessSecret,
    });

    // Save access token in Redis
    await this.addAccessTokenToCache(user.id, this.jwtService.decode(accessToken).iat, "1");

    // Refresh Token
    const refreshToken = uuid4();
    const refreshTokenExp = new Date(Date.now() + ms(jwtConfig.refreshIn)); // expiration in milliseconds

    await this.prisma.refreshToken.create({
      data: {
        refreshToken: refreshToken,
        userId: user.id,
        validUntil: refreshTokenExp,
      },
    });

    const userRoles = await this.prisma.userRole.findMany({
      where: {
        userId: user.id,
      },
      include: {
        role: true,
      },
    });

    const roles = userRoles.map((ur) => ur.role.name);

    // note: all tokens are in seconds
    return {
      accessToken,
      refreshToken,
      roles,
      accessExp: this.jwtService.decode(accessToken)['exp'],
      refreshExp: Math.floor(refreshTokenExp.getTime() / 1000), // convert to seconds
      iat: iat,
    };
  }

  async login(login: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userService.getUserByEmail(login.email);
    if (!user) {
      throw new NotFoundException('Wrong email or password');
    }

    if (!this.passwordService.validatePassword(login.password, user.password)) {
      throw new NotFoundException('Wrong email or password');
    }

    return await this.generateNewTokens(user);
  }

  async signUp(signUpDto: SignUpDto): Promise<GenericResponse> {
    const hashedPassword = await this.passwordService.hashPassword(
      signUpDto.password,
    );

    const userExists = await this.userService.getUserByEmail(signUpDto.email);
    if (userExists) {
      throw new ConflictException('User already exists');
    }

    const user = await this.prisma.user.create({
      data: {
        email: signUpDto.email,
        password: hashedPassword,
        firstName: signUpDto.firstName,
        lastName: signUpDto.lastName,
      },
    });

    //Assign user role
    const userRole = await this.prisma.role.findFirst({
      where: { name: clientRoleName },
    });
    await this.prisma.userRole.create({
      data: {
        role: {
          connect: {
            id: userRole.id,
          },
        },
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return {
      success: true,
      message: 'User created successfully, Now you can login',
    };
  }

  async logout(user: JwtPayloadDto, refreshToken: string): Promise<void> {
    await this.invalidateRefreshToken(refreshToken);
    if(user){
      await this.removeAccessTokenFromCache(user.userId, user.iat);
    }
  }

  async refreshToken(user: JwtPayloadDto, refreshToken: string): Promise<any> {
    // Validate refresh token
    const token = await this.getRefreshToken(refreshToken);
    if (!token) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.invalidateRefreshToken(refreshToken);

    // Invalidate Access Token from Cache
    await this.removeAccessTokenFromCache(user.userId, user.iat);

    // Generate new tokens
    return await this.generateNewTokens({
      email: user.email,
      id: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  }

  async forgotPassword(email: string): Promise<any> {
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    //Create new ResetPassword entry on db
    const resetPassword = await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        validUntil: new Date(Date.now() + ms('1h')),
      },
    });

    //Send email with reset password link
    const link: string = `${this.configService.get<FrontentConfig>(ConfigNames.frontend).resetPasswordUrl}?token=${resetPassword.resetToken}`;

    //Email Service should be called here

    // TODO: modificar
    return {
      link: link,
      ...resetPassword,
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<any> {
    throw new Error('Method not implemented.');
    const resetPassword = await this.prisma.passwordReset.findUnique({
      where: {
        resetToken: token,
      },
    });

    if (!resetPassword) {
      throw new NotFoundException('Invalid token');
    }

    if (resetPassword.validUntil < new Date()) {
      throw new UnauthorizedException('Token has expired');
    }

    const hashedPassword = await this.passwordService.hashPassword(newPassword);

    await this.prisma.user.update({
      where: {
        id: resetPassword.userId,
      },
      data: {
        password: hashedPassword,
      },
    });

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }
}
