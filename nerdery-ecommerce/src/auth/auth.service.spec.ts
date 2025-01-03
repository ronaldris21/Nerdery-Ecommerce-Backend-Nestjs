import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PasswordReset } from '@prisma/client';
import { ConfigNames, FrontendConfig } from 'src/common/config/config.interface';
import { ROLES } from 'src/common/constants';
import { validUUID1, validUUID2 } from 'src/common/testing-mocks/helper-data';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';

import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/authResponse.dto';
import { JwtPayloadDto } from './dto/jwtPayload.dto';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token/token.service';
import { UsersService } from './services/users.service';

const mockPrismaServiceInit = {
  user: {
    create: jest.fn(),
    update: jest.fn(),
  },
  role: {
    findFirst: jest.fn(),
  },
  userRole: {
    create: jest.fn(),
  },
  passwordReset: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

const validUserWithEmail = {
  id: validUUID1,
  email: 'riskai.xd@ragnarok.com',
  password: 'hashedPassword',
  firstName: 'Ronald',
  lastName: 'Ris',
  createdAt: new Date(),
};

const fakeDecodedUser: JwtPayloadDto = {
  userId: validUUID1,
  email: 'test@example.com',
  iat: 123,
  exp: 456,
  firstName: 'Kai',
  lastName: 'Ris',
  roles: [ROLES.CLIENT],
};

const authResponse: AuthResponseDto = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  accessExp: 123,
  refreshExp: 456,
  iat: 789,
  roles: ['CLIENT'],
};

const signUpDto: SignUpDto = {
  email: 'test@example.com',
  password: 'password',
  firstName: 'Ronald',
  lastName: 'Ris',
};

const passwordReset: PasswordReset = {
  alreadyUsed: false,
  createdAt: new Date(),
  resetToken: 'reset-token',
  userId: validUUID1,
  validUntil: new Date(Date.now() + 60 * 60 * 1000),
};

describe('AuthService', () => {
  let service: AuthService;

  let prismaService: typeof mockPrismaServiceInit;
  let configService: Partial<ConfigService>;

  let passwordService: DeepMocked<PasswordService>;
  let jwtService: DeepMocked<JwtService>;
  let mailService: DeepMocked<MailService>;
  let userService: DeepMocked<UsersService>;
  let tokenService: DeepMocked<TokenService>;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string): Partial<FrontendConfig> => {
        if (key === ConfigNames.frontend) {
          return {
            resetPasswordFrontendUrl: 'http://example.com/reset/',
            paymentClientSecretFrontendUrl: 'http://example.com/payment?id=',
          };
        }
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaServiceInit,
        },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PasswordService, useValue: createMock<PasswordService>() },
        { provide: JwtService, useValue: createMock<JwtService>() },
        { provide: MailService, useValue: createMock<MailService>() },
        { provide: UsersService, useValue: createMock<UsersService>() },
        { provide: TokenService, useValue: createMock<TokenService>() },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    configService = module.get(ConfigService);
    passwordService = module.get(PasswordService);
    jwtService = module.get(JwtService);
    mailService = module.get(MailService);
    userService = module.get(UsersService);
    tokenService = module.get(TokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(configService).toBeDefined();
    expect(passwordService).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(mailService).toBeDefined();
    expect(userService).toBeDefined();
    expect(tokenService).toBeDefined();
  });

  describe('signUp', () => {
    it('should create a new user and assign CLIENT role', async () => {
      userService.getUserByEmail.mockResolvedValue(null); // The user does not exist
      passwordService.hashPassword.mockResolvedValue('hashedPassword');
      prismaService.user.create.mockResolvedValue({
        id: validUUID1,
        email: signUpDto.email,
        password: 'hashedPassword',
        firstName: signUpDto.firstName,
        lastName: signUpDto.lastName,
        createdAt: new Date(),
      });
      prismaService.role.findFirst.mockResolvedValue({
        id: validUUID2,
        name: ROLES.CLIENT,
      });

      const result = await service.signUp(signUpDto);

      expect(userService.getUserByEmail).toHaveBeenCalledWith(signUpDto.email);
      expect(passwordService.hashPassword).toHaveBeenCalledWith(signUpDto.password);
      expect(prismaService.user.create).toHaveBeenCalled();
      expect(prismaService.role.findFirst).toHaveBeenCalledWith({
        where: { name: ROLES.CLIENT },
      });
      expect(prismaService.userRole.create).toHaveBeenCalled();
      expect(result.statusCode).toEqual(201);
    });

    it('should throw ConflictException if the user email already exists', async () => {
      userService.getUserByEmail.mockResolvedValue({ id: 1, email: 'test@example.com' } as any);
      await expect(service.signUp(signUpDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login successfully if credentials are correct', async () => {
      const loginDto: LoginDto = {
        email: validUserWithEmail.email,
        password: validUserWithEmail.password,
      };
      userService.getUserByEmail.mockResolvedValue(validUserWithEmail);
      passwordService.validatePassword.mockResolvedValue(true);
      userService.getUserRoles.mockResolvedValue(['CLIENT']);
      tokenService.generateTokensForUser.mockResolvedValue(authResponse);

      const result = await service.login(loginDto);

      expect(userService.getUserByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(passwordService.validatePassword).toHaveBeenCalledWith(
        loginDto.password,
        'hashedPassword',
      );
      expect(tokenService.generateTokensForUser).toHaveBeenCalled();
      expect(result).toEqual(authResponse);
    });

    it('should throw NotFoundException if the user does not exist', async () => {
      userService.getUserByEmail.mockResolvedValue(null);

      await expect(service.login({ email: 'none@example.com', password: 'xxx' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if the password is incorrect', async () => {
      userService.getUserByEmail.mockResolvedValue({
        ...validUserWithEmail,
        password: 'hashedPasswordWrong',
      });
      passwordService.validatePassword.mockResolvedValue(false);

      await expect(service.login({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow(
        'Wrong email or password',
      );
    });
  });

  describe('logout', () => {
    it('should invalidate the refresh token and remove the access token from cache', async () => {
      const fakeRefreshToken = 'refresh-token';
      const fakeAccessToken = 'access-token';
      jwtService.decode.mockReturnValue(fakeDecodedUser);

      await service.logout(fakeRefreshToken, fakeAccessToken);

      expect(tokenService.invalidateRefreshToken).toHaveBeenCalledWith(fakeRefreshToken);
      expect(tokenService.removeAccessTokenFromCache).toHaveBeenCalledWith(
        fakeDecodedUser.userId,
        fakeDecodedUser.iat,
      );
    });
  });

  describe('refreshToken', () => {
    beforeEach(() => {
      tokenService.generateTokensForUser.mockReset();
    });

    it('should generate new tokens if everything is valid', async () => {
      const fakeAccessToken = 'access-token';
      const fakeRefreshToken = 'refresh-token';
      jwtService.decode.mockReturnValue(fakeDecodedUser);
      userService.findById.mockResolvedValue(validUserWithEmail); // Simulate found user in DB
      tokenService.validateRefreshTokenOrThrow.mockResolvedValue(undefined);
      tokenService.invalidateRefreshToken.mockResolvedValue(undefined);
      tokenService.removeAccessTokenFromCache.mockResolvedValue(undefined);
      userService.getUserRoles.mockResolvedValue([ROLES.CLIENT]);

      tokenService.generateTokensForUser.mockResolvedValue({
        ...authResponse,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      const result = await service.refreshToken(fakeAccessToken, fakeRefreshToken);

      expect(tokenService.validateRefreshTokenOrThrow).toHaveBeenCalledWith(fakeRefreshToken);
      expect(tokenService.invalidateRefreshToken).toHaveBeenCalledWith(fakeRefreshToken);
      expect(tokenService.removeAccessTokenFromCache).toHaveBeenCalledWith(
        validUserWithEmail.id,
        fakeDecodedUser.iat,
      );
      expect(result).toEqual({
        ...authResponse,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('should throw UnprocessableEntityException if it cannot decode the access token', async () => {
      jwtService.decode.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      await expect(service.refreshToken('invalid-access-token', 'refresh-token')).rejects.toThrow();

      expect(tokenService.generateTokensForUser).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user is not in the database', async () => {
      const fakeDecodeUserWrongId: JwtPayloadDto = { ...fakeDecodedUser, userId: 'wrong-id' };
      jwtService.decode.mockReturnValue(fakeDecodeUserWrongId);
      userService.findById.mockResolvedValue(null);

      await expect(service.refreshToken('access-token', 'refresh-token')).rejects.toThrow(
        NotFoundException,
      );

      expect(tokenService.generateTokensForUser).not.toHaveBeenCalled();
    });

    it('should throw an error if validateRefreshTokenOrThrow fails', async () => {
      jwtService.decode.mockReturnValue(fakeDecodedUser);
      userService.findById.mockResolvedValue(validUserWithEmail);
      tokenService.validateRefreshTokenOrThrow.mockRejectedValue(
        new Error('Refresh token is invalid or expired'),
      );

      await expect(service.refreshToken('access-token', 'refresh-token')).rejects.toThrow(
        'Refresh token is invalid or expired',
      );

      expect(tokenService.generateTokensForUser).not.toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    it('should send the reset password email if the user exists', async () => {
      const email = 'test@example.com';
      userService.getUserByEmail.mockResolvedValue(validUserWithEmail);
      prismaService.passwordReset.create.mockResolvedValue(passwordReset);

      const result = await service.forgotPassword(email);

      expect(userService.getUserByEmail).toHaveBeenCalledWith(email);
      expect(prismaService.passwordReset.create).toHaveBeenCalled();
      expect(mailService.sendPasswordResetEmail).toHaveBeenCalled();
      expect(result.statusCode).toEqual(200);
    });

    it('should throw NotFoundException if the user does not exist', async () => {
      userService.getUserByEmail.mockResolvedValue(null);

      await expect(service.forgotPassword('none@example.com')).rejects.toThrow(NotFoundException);
    });
  });

  describe('resetPassword', () => {
    beforeEach(() => {
      prismaService.passwordReset.update.mockReset();
      prismaService.user.update.mockReset();
      tokenService.invalidateAllRefreshTokens.mockReset();
      tokenService.removeAccessTokenFromCacheByUserId.mockReset();
      mailService.sendPasswordChangedNotification.mockReset();
    });
    it('should reset the password if the token is valid and not expired', async () => {
      const resetToken = 'valid-token';
      const passwordReset2 = { ...passwordReset, resetToken };
      prismaService.passwordReset.findUnique.mockResolvedValue(passwordReset2);
      passwordService.hashPassword.mockResolvedValue('hashedNewPassword');
      prismaService.user.update.mockResolvedValue({
        id: passwordReset2.userId,
        email: 'test@example.com',
        password: 'hashedNewPassword',
      } as any);

      const result = await service.resetPassword({
        resetToken,
        password: 'new-password',
      });

      expect(prismaService.passwordReset.findUnique).toHaveBeenCalledWith({
        where: { resetToken },
      });
      expect(passwordService.hashPassword).toHaveBeenCalledWith('new-password');
      expect(prismaService.user.update).toHaveBeenCalled();
      expect(prismaService.passwordReset.update).toHaveBeenCalledWith({
        where: { resetToken },
        data: { alreadyUsed: true },
      });
      expect(tokenService.invalidateAllRefreshTokens).toHaveBeenCalledWith(passwordReset2.userId);
      expect(tokenService.removeAccessTokenFromCacheByUserId).toHaveBeenCalledWith(
        passwordReset2.userId,
      );
      expect(mailService.sendPasswordChangedNotification).toHaveBeenCalled();
      expect(result.statusCode).toEqual(200);
    });

    it('should throw NotFoundException if the token does not exist', async () => {
      prismaService.passwordReset.findUnique.mockResolvedValue(null);

      await expect(
        service.resetPassword({ resetToken: 'invalid', password: 'anything' }),
      ).rejects.toThrow('Invalid reset token');

      expect(tokenService.invalidateAllRefreshTokens).not.toHaveBeenCalled();
      expect(tokenService.removeAccessTokenFromCacheByUserId).not.toHaveBeenCalled();
      expect(mailService.sendPasswordChangedNotification).not.toHaveBeenCalled();
      expect(prismaService.passwordReset.update).not.toHaveBeenCalled();
      expect(prismaService.user.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if the token has expired', async () => {
      prismaService.passwordReset.findUnique.mockResolvedValue({
        ...passwordReset,
        validUntil: new Date(Date.now() - 1000), // In the past
        alreadyUsed: false,
      } as PasswordReset);

      await expect(
        service.resetPassword({ resetToken: 'expired', password: 'anything' }),
      ).rejects.toThrow('Reset token has expired');

      expect(tokenService.invalidateAllRefreshTokens).not.toHaveBeenCalled();
      expect(tokenService.removeAccessTokenFromCacheByUserId).not.toHaveBeenCalled();
      expect(mailService.sendPasswordChangedNotification).not.toHaveBeenCalled();
      expect(prismaService.passwordReset.update).not.toHaveBeenCalled();
      expect(prismaService.user.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if the token has already been used', async () => {
      prismaService.passwordReset.findUnique.mockResolvedValue({
        ...passwordReset,
        validUntil: new Date(Date.now() + 1000),
        alreadyUsed: true,
      } as PasswordReset);

      await expect(
        service.resetPassword({ resetToken: 'usedtoken', password: 'anything' }),
      ).rejects.toThrow('Token has already been used');

      expect(tokenService.invalidateAllRefreshTokens).not.toHaveBeenCalled();
      expect(tokenService.removeAccessTokenFromCacheByUserId).not.toHaveBeenCalled();
      expect(mailService.sendPasswordChangedNotification).not.toHaveBeenCalled();
      expect(prismaService.passwordReset.update).not.toHaveBeenCalled();
      expect(prismaService.user.update).not.toHaveBeenCalled();
    });
  });
});
