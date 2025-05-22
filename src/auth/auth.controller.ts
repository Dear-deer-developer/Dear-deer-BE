import { Controller, Post, Body, Query, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('kakao')
  async kakao(@Body('accessToken') accessToken: string) {
    const firebaseToken = await this.authService.kakaoLogin(accessToken);
    return { firebaseToken };
  }

  @Get('kakao/callback')
  async handleKakaoCallback(@Query('code') code: string) {
    const accessToken = await this.authService.getKakaoAccessToken(code);
    const firebaseToken = await this.authService.kakaoLogin(accessToken);
    return { firebaseToken };
  }
}
