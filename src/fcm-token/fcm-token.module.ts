import { Module } from '@nestjs/common';
import { FcmTokenService } from './fcm-token.service';
import { FcmTokenRepository } from './fcm-token.repository';
import { FcmTokenController } from './fcm-token.controller';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [UsersModule, AuthModule],
  controllers: [FcmTokenController],
  providers: [FcmTokenService, FcmTokenRepository],
  exports: [FcmTokenService, FcmTokenRepository], // 알람 발송 모듈에서 토큰 조회 시 재사용 가능
})
export class FcmTokenModule {}
