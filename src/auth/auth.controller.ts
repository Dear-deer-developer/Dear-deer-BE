import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseAdminService } from 'src/firebase/firebase-admin.service';
import {
  SwaggerKakaoLogin,
  SwaggerKakaoCallback,
  SwaggerDevGetIdToken,
  SwaggerWhoAmI,
  SwaggerLogout,
} from './auth.swagger';
import { FirebaseAuthGuard } from './firebase-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly firebaseAdminService: FirebaseAdminService,
  ) {}

  /** 카카오 accessToken -> firebase customToken */
  @Post('kakao')
  @SwaggerKakaoLogin()
  async kakao(@Body('accessToken') accessToken: string) {
    const firebaseToken = await this.authService.kakaoLogin(accessToken);
    return { firebaseToken };
  }

  /** 카카오 OAuth 콜백 -> firebase customToken */
  @Get('kakao/callback')
  @SwaggerKakaoCallback()
  async handleKakaoCallback(@Query('code') code: string) {
    const accessToken = await this.authService.getKakaoAccessToken(code);
    const firebaseToken = await this.authService.kakaoLogin(accessToken);
    return { firebaseToken };
  }

  /** [개발용] Custom Token -> ID Token */
  @Post('id-token')
  @SwaggerDevGetIdToken()
  async getIdToken(@Body('customToken') customToken: string) {
    const idToken =
      await this.firebaseAdminService.getIdTokenFromCustomToken(customToken);
    return { idToken };
  }

  /** 내 상태 확인 (관리자 여부 포함) */
  @UseGuards(FirebaseAuthGuard)
  @Get('whoami')
  @SwaggerWhoAmI()
  async whoami(@Req() req: any) {
    return this.authService.getWhoAmI(req.user);
  }

  /** 로그아웃: 서버 측 세션 무효화(선택 기능) */
  @UseGuards(FirebaseAuthGuard)
  @Post('logout')
  @SwaggerLogout()
  async logout(@Req() req: any) {
    await this.firebaseAdminService.revokeUserSessions(req.user.uid);
    return { message: '로그아웃 처리되었습니다.' };
  }
}
