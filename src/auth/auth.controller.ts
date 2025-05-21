import { Controller, Post, Body, Query, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { access } from 'fs';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body('idToken') idToken: string) {
    const user = await this.authService.authenticate(idToken);
    return { user };
  }

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

//카카오 인가코드 -> accessToken 발급 -> 사용자 정보 요청 -> db 조회 or 생성 -> firebaseCustomToken 발급 -> 프론트로 전달
