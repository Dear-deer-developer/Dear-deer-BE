import { Injectable } from '@nestjs/common';
import { Platform } from '@prisma/client';
import { FcmTokenRepository } from './fcm-token.repository';

@Injectable()
export class FcmTokenService {
  constructor(private readonly fcmTokenRepository: FcmTokenRepository) {}

  // 저장/갱신(로그인 or 권한 허용 or 토큰 리프레시 시 호출)
  async register(userId: number, token: string, platform: Platform) {
    const row = await this.fcmTokenRepository.upsertByToken({
      userId,
      token,
      platform,
    });
    return { id: row.id, isActive: row.isActive };
  }

  // 비활성화(로그아웃 or 앱 삭제 직전 등, 소프트 삭제)
  async deactivate(userId: number, token: string) {
    const res = await this.fcmTokenRepository.deactivateByToken({
      userId,
      token,
    });
    return { affected: res.count };
  }

  // 필요시 하드 삭제 엔드포인트로 사용
  async hardDelete(userId: number, token: string) {
    const res = await this.fcmTokenRepository.deleteByToken({ userId, token });
    return { affected: res.count };
  }
}
