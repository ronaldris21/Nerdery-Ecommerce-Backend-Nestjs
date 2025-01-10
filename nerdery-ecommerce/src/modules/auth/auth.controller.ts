import { Controller, Get, Post, Body, UseGuards, HttpCode } from '@nestjs/common';
import { hours, minutes, Throttle } from '@nestjs/throttler';
import { GenericResponseDto } from 'src/common/data/dto/generic-response.dto';

import { AuthService } from './auth.service';
import { GetAccessToken } from './decoratos/get-jwtPayload.decorator';
import { GetUser } from './decoratos/get-user.decorator';
import { ForgotPasswordDto } from './dto/request/forgotPassword.dto';
import { LoginDto } from './dto/request/login.dto';
import { AuthResponseDto } from './dto/response/authResponse.dto';
import { JwtPayloadDto } from './dto/response/jwtPayload.dto';
import { RefreshTokenDto } from './dto/response/refreshToken.dto';
import { ResetPasswordDto } from './dto/response/resetPassword.dto';
import { SignUpDto } from './dto/response/signup.dto';
import { AccessTokenGuard } from './guards/access-token.guard';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(AccessTokenGuard)
  me(@GetUser() user: JwtPayloadDto): JwtPayloadDto {
    return user;
  }

  @Post('logout')
  @HttpCode(200)
  logout(
    @Body() refreshTokenDto: RefreshTokenDto,
    @GetAccessToken() accessToken: string,
  ): Promise<void> {
    return this.authService.logout(refreshTokenDto.refreshToken, accessToken);
  }

  @Post('login')
  @Throttle({ default: { ttl: minutes(5), limit: 10 } })
  @HttpCode(200)
  login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('signup')
  signUp(@Body() signUpDto: SignUpDto): Promise<GenericResponseDto> {
    return this.authService.signUp(signUpDto);
  }

  @UseGuards(AccessTokenGuard)
  @Post('refresh-token')
  refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @GetAccessToken() accessToken: string,
  ): Promise<AuthResponseDto> {
    return this.authService.refreshToken(accessToken, refreshTokenDto.refreshToken);
  }

  @Post('forgot-password')
  @Throttle({ default: { ttl: hours(1), limit: 5 } })
  @HttpCode(200)
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<GenericResponseDto> {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @Throttle({ default: { ttl: hours(1), limit: 5 } })
  @HttpCode(200)
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<GenericResponseDto> {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
