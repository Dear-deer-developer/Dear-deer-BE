import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseAdminService } from 'src/firebase/firebase-admin.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { RegisterUserResponseDto } from './dto/res-register-user.dto';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
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

  @Post('register')
  @ApiOperation({ summary: '회원가입 - 닉네임 등록' })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({
    status: 201,
    description: '회원가입 완료',
    type: RegisterUserResponseDto,
  })
  async register(
    @Body() body: RegisterUserDto,
  ): Promise<RegisterUserResponseDto> {
    return this.authService.register(body);
  }
}
