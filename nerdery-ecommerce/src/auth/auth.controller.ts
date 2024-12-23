import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  Res,
  Req,
  BadRequestException,
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
import { Exception } from 'handlebars';
import { ResetPasswordDto } from './dto/resetPassword.dto';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
  ) { }

  @Get('me')
  @UseGuards(RestAccessTokenGuard)
  me(@GetUser() user: JwtPayloadDto) {
    return user;
  }

  //TODO: DOES THIS MAKES SENSE TO ALWAYS RETURN 200? ASK MENTOR
  @Post('logout')
  @HttpCode(200) //TODO: does this makes sense, i dont want to return anything, just success code
  logout(
    @Body() refreshTokenDto: RefreshTokenDto,
    @GetAccessToken() accessToken: string
  ) {
    //All requests are successful, even if the refresh token is invalid, if valid, session is closed 
    // TODO: sHOULD ASSOCIATE THE REFRESH TOKEN WITH THE USER AND DELETE IT FROM CACHE MANUALY?
    this.authService.logout(refreshTokenDto.refreshToken, accessToken);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    return await this.authService.login(loginDto);
  }



  @Post('signup')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  //TODO: test
  @UseGuards(RestAccessTokenGuard)
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
  @HttpCode(200)
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }


}
