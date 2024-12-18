import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { GetUser } from './decoratos/get-user.decorator';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { JwtPayloadDto } from './dto/jwtPayload.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { SignUpDto } from './dto/signup.dto';
import { RestAccessTokenGuard } from './guards/restAccessToken.guard';
import { Response } from 'express';
import { debug } from 'console';
import { JwtService } from '@nestjs/jwt';
import { GetAccessToken } from './decoratos/get-jwtPayload.decorator';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  attachCookies(res: Response, cookieName: string, value: string) {
    res.cookie(cookieName, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict',
    });
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(RestAccessTokenGuard)
  me(@GetUser() user: JwtPayloadDto) {
    return user;
  }

  @Post('signup')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  //TODO: test
  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  //ACCESS TOKEN HAS TO BE PASSED EVEN IF IT IS EXPIRED in order to be removed from cache
  private getAccessTokenPayload(@Req() req: any): JwtPayloadDto | null {
    try {
      const authHeader = req.headers['authorization'];
      const accessToken = authHeader && authHeader.split(' ')[1];
      return this.jwtService.decode(accessToken) as JwtPayloadDto;
    } catch (e) {}
    return null;
  }

  @Post('logout')
  @HttpCode(204)
  logout(
    @Body() refreshTokenDto: RefreshTokenDto,
    @GetAccessToken() accessToken: string
  ) {
    // This is always 204 even if the token is not found
    try {
      const user = this.jwtService.decode(accessToken) as JwtPayloadDto;
      return this.authService.logout(user, refreshTokenDto.refreshToken);
    } catch (error) {}
  }

  //TODO: test
  @Post('refresh-token')
  refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @GetAccessToken() accessToken: string,
  ) {
    try {
      const user = this.jwtService.decode(accessToken) as JwtPayloadDto;
      return this.authService.refreshToken(user, refreshTokenDto.refreshToken);
    } catch (error) {
      throw new UnauthorizedException(
        'You are required to provide the access token even if it has expired. If you dont have it, please login again',
      );
    }
  }
}
