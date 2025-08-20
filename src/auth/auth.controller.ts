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
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { FirebaseAuthGuard } from './firebase-auth.guard';

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

  /** 내 상태 확인 (권한 포함) */
  @UseGuards(FirebaseAuthGuard)
  @Get('whoami')
  async whoami(@Req() req: any) {
    const admins = (process.env.ADMINS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const isAdmin = !!req.user && admins.includes(req.user.uid);
    return { uid: req.user?.uid, userId: req.user?.id, isAdmin };
  }

  /** 로그아웃: 서버측 세션 무효화(선택 기능) */
  @UseGuards(FirebaseAuthGuard)
  @Post('logout')
  async logout(@Req() req: any) {
    await this.firebaseAdminService.revokeUserSessions(req.user.uid);
    return { message: '로그아웃 처리되었습니다.' };
  }
}
