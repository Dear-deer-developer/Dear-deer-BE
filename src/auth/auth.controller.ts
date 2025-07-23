import { Controller, Post, Body, Query, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseAdminService } from 'src/firebase/firebase-admin.service';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly firebaseAdminService: FirebaseAdminService,
  ) {}

  @Post('kakao')
  @ApiOperation({ summary: '카카오 accessToken으로 Firebase customToken 발급' })
  @ApiBody({ schema: { example: { accessToken: '카카오 엑세스 토큰' } } })
  @ApiResponse({ status: 200, description: 'Firebase Custom Token 발급 성공' })
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

  @Post('grant-admin')
  async grantAdmin(@Body('uid') uid: string) {
    await this.firebaseAdminService.setAdminClaim(uid);
    return { message: '관리자 권한이 부여되었습니다.' };
  }
}
