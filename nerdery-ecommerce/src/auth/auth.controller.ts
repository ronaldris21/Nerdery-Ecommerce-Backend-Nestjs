import { Controller, Get, Post, Body, UseGuards, HttpCode } from '@nestjs/common';
import { hours, Throttle } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import { GetAccessToken } from './decoratos/get-jwtPayload.decorator';
import { GetUser } from './decoratos/get-user.decorator';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { JwtPayloadDto } from './dto/jwtPayload.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { SignUpDto } from './dto/signup.dto';
import { AccessTokenGuard } from './guards/access-token.guard';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(AccessTokenGuard)
  me(@GetUser() user: JwtPayloadDto) {
    return user;
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Body() refreshTokenDto: RefreshTokenDto, @GetAccessToken() accessToken: string) {
    return this.authService.logout(refreshTokenDto.refreshToken, accessToken);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('signup')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @UseGuards(AccessTokenGuard)
  @Post('refresh-token')
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto, @GetAccessToken() accessToken: string) {
    return this.authService.refreshToken(accessToken, refreshTokenDto.refreshToken);
  }

  @Post('forgot-password')
  @HttpCode(200)
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @Throttle({ default: { ttl: hours(1), limit: 5 } })
  @HttpCode(200)
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
