import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseAdminService } from 'src/firebase/firebase-admin.service';
import {
  SwaggerKakaoLogin,
  SwaggerKakaoCallback,
  SwaggerDevGetIdToken,
  SwaggerWhoAmI,
  SwaggerLogout,
  ApiAuthNative,
} from './auth.swagger';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { AuthRegisterDto } from './dtos/auth-register.dto';
import { AuthLoginDto } from './dtos/auth-login.dto';
import { TokenResponseDto } from './dtos/token-res.dto';
import { GetUserId } from './decorators/get-user-id.decorator';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly firebaseAdminService: FirebaseAdminService,
  ) {}

  @Post('native/register')
  @ApiAuthNative.register()
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: AuthRegisterDto): Promise<TokenResponseDto> {
    return this.authService.register(dto);
  }

  @Post('native/login')
  @ApiAuthNative.login()
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: AuthLoginDto): Promise<TokenResponseDto> {
    return this.authService.login(dto);
  }

  @Post('native/refresh')
  @ApiAuthNative.refresh()
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Headers('refresh-token') refreshToken: string,
  ): Promise<TokenResponseDto> {
<<<<<<< HEAD
=======
    // 갱신 토큰을 Body로 받아 서비스로 전달하여 검증 및 재발급 처리
>>>>>>> 8bb9ec4 (feat/#44/자체로그인(native) 기능 추가)
    return this.authService.refreshTokens(refreshToken);
  }

  @Post('native/logout')
  @ApiAuthNative.logout()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('accessToken'))
  async logout(@GetUserId() userId: number): Promise<void> {
    await this.authService.logout(userId);
  }

  /////////// 아래는 소셜로그인 ///////////

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

  // /** 로그아웃: 서버 측 세션 무효화(선택 기능) */ // 일단 자체로그인 로그아웃만 살려놓음 (10.13)
  // @UseGuards(FirebaseAuthGuard)
  // @Post('logout')
  // @SwaggerLogout()
  // async logout(@Req() req: any) {
  //   await this.firebaseAdminService.revokeUserSessions(req.user.uid);
  //   return { message: '로그아웃 처리되었습니다.' };
  // }
}
