import { Controller, Post, Body, Query, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseAdminService } from 'src/firebase/firebase-admin.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly firebaseAdminService: FirebaseAdminService,
  ) {}

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

  /** 개발시에 사용할 api */
  @Post('id-token')
  async getIdToken(@Body('customToken') customToken: string) {
    const idToken =
      await this.firebaseAdminService.getIdTokenFromCustomToken(customToken);
    return { idToken };
  }
}
