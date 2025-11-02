import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
  Patch,
  Delete,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthRegisterDto } from '../dtos/auth-register.dto';
import { AuthLoginDto } from '../dtos/auth-login.dto';
import { TokenResponseDto } from '../dtos/token-res.dto';
import { GetUserId } from '../decorators/get-user-id.decorator';
import { AuthGuard } from '@nestjs/passport';
import { AuthEmailDto } from '../dtos/auth-email.dto';
import { SetNewPasswordDto } from '../dtos/set-new-password.dto';
import { VerifyCodeDto } from '../dtos/verify-code.dto';
import { VerifyCurrentPasswordDto } from '../dtos/verify-current-password.dto';

import { AuthNativeService } from './auth-native.service';
import { ApiAuthNative } from './auth-native.swagger';
import { CheckNicknameDto } from '../dtos/check-nickname.dto';
import { CheckEmailDto } from '../dtos/check-email.dto';
import { AuthWithdrawDto } from '../dtos/auth-withdraw.dto';

@ApiTags('auth-native')
@Controller('auth')
export class AuthNativeController {
  constructor(private readonly authNativeService: AuthNativeService) {}

  // 회원가입
  @Post('native/register')
  @ApiAuthNative.register()
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: AuthRegisterDto): Promise<TokenResponseDto> {
    return this.authNativeService.register(dto);
  }

  // 로그인
  @Post('native/login')
  @ApiAuthNative.login()
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: AuthLoginDto): Promise<TokenResponseDto> {
    return this.authNativeService.login(dto);
  }

  // 회원가입시 이메일 중복확인
  @Get('native/check-email')
  @ApiAuthNative.checkEmail()
  @HttpCode(HttpStatus.OK)
  async checkEmail(@Query() dto: CheckEmailDto): Promise<{ message: string }> {
    return this.authNativeService.checkEmailExists(dto.email);
  }

  // 회원가입시 닉네임 중복확인
  @Get('native/check-nickname')
  @ApiAuthNative.checkNickname()
  @HttpCode(HttpStatus.OK)
  async checkNickname(
    @Query() dto: CheckNicknameDto,
  ): Promise<{ message: string }> {
    return this.authNativeService.checkNicknameExists(dto.nickname);
  }

  // 토큰 갱신
  @Post('native/refresh')
  @ApiAuthNative.refresh()
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Headers('refresh-token') refreshToken: string,
  ): Promise<TokenResponseDto> {
    // 갱신 토큰을 Body로 받아 서비스로 전달하여 검증 및 재발급 처리
    return this.authNativeService.refreshTokens(refreshToken);
  }

  // 로그아웃
  @Post('native/logout')
  @ApiAuthNative.logout()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('accessToken'))
  async logout(@GetUserId() userId: number): Promise<void> {
    await this.authNativeService.logout(userId);
  }

  // 이메일 인증코드 요청 (회원가입 할 때 이메일로 인증코드를 발송)
  @Post('native/register/auth-code')
  @ApiAuthNative.sendRegisterCode()
  @HttpCode(HttpStatus.OK)
  async sendRegisterCode(@Body() dto: AuthEmailDto) {
    // 계정 존재 여부 노출 방지를 위해 성공/실패와 무관하게 동일 메시지 반환
    return this.authNativeService.sendRegisterCode(dto.email);
  }

  // 이메일 인증코드 요청 (비밀번호 찾을 때 이메일로 인증코드를 발송)
  @Post('native/password/auth-code')
  @ApiAuthNative.sendResetPasswordCode()
  @HttpCode(HttpStatus.OK)
  async sendResetPasswordCode(@Body() dto: AuthEmailDto) {
    // 계정 존재 여부 노출 방지를 위해 성공/실패와 무관하게 동일 메시지 반환
    return this.authNativeService.sendPasswordResetCode(dto.email);
  }

  // 이메일 인증 코드 검사 (회원가입 할 때 사용)
  @Post('native/register/verify-code')
  @ApiAuthNative.verifyRegisterCode()
  @HttpCode(HttpStatus.OK)
  async verifyRegisterCode(
    @Body() verifyCodeDto: VerifyCodeDto,
  ): Promise<{ message: string }> {
    return this.authNativeService.verifyRegisterCode(
      verifyCodeDto.email,
      verifyCodeDto.code,
    );
  }

  // 이메일 인증 코드 검사 (비밀번호 찾을 때 사용)
  @Post('native/password/verify-code')
  @ApiAuthNative.verifyPasswordCode()
  @HttpCode(HttpStatus.OK)
  async verifyPasswordCode(
    @Body() verifyCodeDto: VerifyCodeDto,
  ): Promise<TokenResponseDto> {
    return this.authNativeService.verifyPasswordCode(
      verifyCodeDto.email,
      verifyCodeDto.code,
    );
  }

  // 새 비밀번호 설정
  @Patch('native/password')
  @ApiAuthNative.resetPassword()
  @UseGuards(AuthGuard('accessToken'))
  @HttpCode(HttpStatus.OK)
  async resetMyPassword(
    @GetUserId() userId: number,
    @Body() setNewPasswordDto: SetNewPasswordDto,
  ): Promise<{ message: string }> {
    return this.authNativeService.setNewPassword(
      userId,
      setNewPasswordDto.newPassword,
    );
  }

  // 마이페이지에서 새 비밀번호 설정할 때 현재 비밀번호 검증
  @Post('native/password/verify-current')
  @ApiAuthNative.verifyCurrentPassword()
  @UseGuards(AuthGuard('accessToken'))
  @HttpCode(HttpStatus.OK)
  async verifyCurrentPassword(
    @GetUserId() userId: number,
    @Body() verifyCurrentPasswordDto: VerifyCurrentPasswordDto,
  ): Promise<{ message: string }> {
    return this.authNativeService.verifyCurrentPassword(
      userId,
      verifyCurrentPasswordDto.currentPassword,
    );
  }

  // 회원탈퇴
  @Delete('native/withdraw')
  @ApiAuthNative.withdraw()
  @UseGuards(AuthGuard('accessToken'))
  @HttpCode(204)
  async withdraw(
    @GetUserId() userId: number,
    @Body() dto: AuthWithdrawDto,
  ): Promise<void> {
    return this.authNativeService.withdraw(userId, dto);
  }

  // 아이디 찾기는 앱 리젝되면 이어서 만들 예정(10.18)
  // @Post('find-id')
  // @HttpCode(HttpStatus.OK)
  // async findId(@Body() dto: AuthEmailDto) {
  //   // 계정 존재 여부 노출 방지를 위해 성공/실패와 무관하게 동일 메시지 반환
  //   return this.authNativeService.findUsernameByEmail(dto.email);
  // }
}
