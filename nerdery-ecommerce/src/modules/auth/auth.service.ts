import { debug } from 'console';

import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import ms from 'ms';
import { clientRoleName } from 'src/common/constants';
import { GenericResponseDto } from 'src/common/data/dto/generic-response.dto';
import { ConfigNames, FrontendConfig } from 'src/common/modules/config-env/config.interface';
import { MailService } from 'src/common/modules/mail/mail.service';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';

import { LoginDto } from './dto/request/login.dto';
import { AuthResponseDto } from './dto/response/authResponse.dto';
import { JwtPayloadDto } from './dto/response/jwtPayload.dto';
import { ResetPasswordDto } from './dto/response/resetPassword.dto';
import { SignUpDto } from './dto/response/signup.dto';
import { PasswordService } from './services/password/password.service';
import { TokenService } from './services/token/token.service';
import { UsersService } from './services/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
    private userService: UsersService,
    private tokenService: TokenService,
  ) {}

  async login(login: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userService.getUserByEmail(login.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValidPassword = await this.passwordService.validatePassword(
      login.password,
      user.password,
    );
    if (!isValidPassword) {
      throw new NotFoundException('Wrong email or password');
    }

    const roles = await this.userService.getUserRoles(user.id);

    return await this.tokenService.generateTokensForUser({ ...user, roles });
  }

  async signUp(signUpDto: SignUpDto): Promise<GenericResponseDto> {
    const userExists = await this.userService.getUserByEmail(signUpDto.email);
    if (userExists) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await this.passwordService.hashPassword(signUpDto.password);

    const user = await this.prisma.user.create({
      data: {
        email: signUpDto.email,
        password: hashedPassword,
        firstName: signUpDto.firstName,
        lastName: signUpDto.lastName,
      },
    });

    //Assign CLIENT role to new user
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
      statusCode: 201,
      message: 'User created successfully, Now you can login',
    };
  }

  async logout(refreshToken: string, accessToken: string): Promise<void> {
    await this.tokenService.invalidateRefreshToken(refreshToken);

    try {
      const user: JwtPayloadDto = this.jwtService.decode(accessToken) as JwtPayloadDto;
      if (user) {
        await this.tokenService.removeAccessTokenFromCache(user.userId, user.iat);
      }
    } catch (error) {
      // No need to throw an error if the token is not found
      debug(error);
    }
  }

  async refreshToken(accessToken: string, refreshToken: string): Promise<AuthResponseDto> {
    let user: JwtPayloadDto;
    try {
      user = this.jwtService.decode(accessToken) as JwtPayloadDto;
    } catch (error) {
      debug(error);
      throw new UnprocessableEntityException('Invalid access token, or not sent');
    }

    const dbUser = await this.userService.findById(user?.userId ?? 'fakeId');

    if (!dbUser) {
      throw new NotFoundException('User not in the database');
    }

    // Validate refresh token
    await this.tokenService.validateRefreshTokenOrThrow(refreshToken);

    await this.tokenService.invalidateRefreshToken(refreshToken);

    // Invalidate Access Token from Cache
    await this.tokenService.removeAccessTokenFromCache(user.userId, user.iat);

    const roles = await this.userService.getUserRoles(user.userId);

    // Generate new tokens
    return await this.tokenService.generateTokensForUser({
      email: dbUser.email,
      id: dbUser.id,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      roles: roles,
    });
  }

  async forgotPassword(email: string): Promise<GenericResponseDto> {
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetPassword = await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        validUntil: new Date(Date.now() + ms('1h')),
      },
    });

    //Send email with reset password link
    const resetPasswordFrontendUrl = this.configService.get<FrontendConfig>(
      ConfigNames.frontend,
    ).resetPasswordFrontendUrl;
    const resetURL: string = `${resetPasswordFrontendUrl}?token=${resetPassword.resetToken}`;
    await this.mailService.sendPasswordResetEmail(user, resetURL, resetPassword.resetToken);

    return {
      statusCode: 200,
      message: 'Password reset email sent. You have 1 hour to reset your password',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<GenericResponseDto> {
    const passwordResetRequest = await this.prisma.passwordReset.findUnique({
      where: {
        resetToken: resetPasswordDto.resetToken,
      },
    });

    if (!passwordResetRequest) {
      throw new NotFoundException('Invalid reset token');
    }

    if (passwordResetRequest.validUntil < new Date()) {
      throw new ConflictException('Reset token has expired');
    }

    if (passwordResetRequest.alreadyUsed) {
      throw new ConflictException('Token has already been used');
    }

    const hashedPassword = await this.passwordService.hashPassword(resetPasswordDto.password);

    const user = await this.prisma.user.update({
      where: {
        id: passwordResetRequest.userId,
      },
      data: {
        password: hashedPassword,
      },
    });

    await this.prisma.passwordReset.update({
      where: {
        resetToken: passwordResetRequest.resetToken,
      },
      data: {
        alreadyUsed: true,
      },
    });

    await this.tokenService.invalidateAllRefreshTokens(passwordResetRequest.userId);

    await this.tokenService.removeAccessTokenFromCacheByUserId(passwordResetRequest.userId);

    await this.mailService.sendPasswordChangedNotification(user);

    return {
      statusCode: 200,
      message: 'Password reset successfully, now you can login using your new password',
    };
  }
}
