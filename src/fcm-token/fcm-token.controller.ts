import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FcmTokenService } from './fcm-token.service';
import { ApiFcmToken } from './fcm-token.swagger';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { RegisterFcmTokenDto } from './dtos/register-fcm-token.dto';
import { TokenParamDto } from './dtos/token-param.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('fcm-tokens')
@ApiTags('fcm-tokens')
@ApiFcmToken.auth()
@UseGuards(FirebaseAuthGuard)
export class FcmTokenController {
  constructor(private readonly fcmTokenService: FcmTokenService) {}

  // 최초 등록 or onTokenRefresh(프런트가 리스너로 받음) 시에도 동일하게 호출(upsert)
  @Post()
  @ApiFcmToken.register()
  async register(@Req() req: any, @Body() dto: RegisterFcmTokenDto) {
    const userId: number = req.user.id;
    return this.fcmTokenService.register(userId, dto.token, dto.platform);
  }

  // 토큰 비활성화(로그아웃 or 기기 내 토큰 제거 시)
  @Delete(':token')
  @ApiFcmToken.deactivate()
  async deactivate(@Req() req: any, @Param() params: TokenParamDto) {
    const userId: number = req.user.id;
    return this.fcmTokenService.deactivate(userId, params.token);
  }

  // 필요하면 하드 삭제
  @Delete(':token/hard')
  @ApiFcmToken.hardDelete()
  async hardDelete(@Req() req: any, @Param() params: TokenParamDto) {
    const userId: number = req.user.id;
    return this.fcmTokenService.hardDelete(userId, params.token);
  }

  // 갱신 전용 엔드포인트를 따로 두고 싶으면 PUT도 같은 서비스 호출
  @Put()
  @ApiFcmToken.refresh()
  async refresh(@Req() req: any, @Body() dto: RegisterFcmTokenDto) {
    const userId: number = req.user.id;
    return this.fcmTokenService.register(userId, dto.token, dto.platform);
  }

  // 다시 보면서 생각하면 token 값을 path에서 빼야 좋아보이고,
  // -> 다른 방식으로 토큰값을 넘기는게 좋아보임 (25.09.04)
  // put API 는 필요없어 보임 (POST API와 같은 역할)
  // fcm 토큰은 그렇게 민감한 정보가 담기지 않아서 그냥 path로 넘기기로 결정 (09.13)
}
