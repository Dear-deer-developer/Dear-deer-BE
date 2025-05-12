import { Controller, Post, Body } from '@nestjs/common';
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
}
