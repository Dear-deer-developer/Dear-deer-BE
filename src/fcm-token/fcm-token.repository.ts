import { Injectable } from '@nestjs/common';
import { Platform } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FcmTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  // 저장/갱신(업서트)
  upsertByToken(input: { userId: number; token: string; platform: Platform }) {
    const { userId, token, platform } = input;
    return this.prisma.deviceToken.upsert({
      where: { token },
      create: { userId, token, platform, isActive: true },
      update: { userId, platform, isActive: true, updatedAt: new Date() },
    });
  }

  // 소유자 기준 비활성화(soft delete)
  deactivateByToken(input: { userId: number; token: string }) {
    const { userId, token } = input;
    return this.prisma.deviceToken.updateMany({
      where: { token, userId, isActive: true },
      data: { isActive: false, updatedAt: new Date() },
    });
  }

  // 필요시 하드 삭제
  deleteByToken(input: { userId: number; token: string }) {
    const { userId, token } = input;
    return this.prisma.deviceToken.deleteMany({
      where: { token, userId },
    });
  }

  // 유저의 활성 토큰 목록 (발송 시 사용)
  findActiveTokensByUserId(userId: number) {
    return this.prisma.deviceToken.findMany({
      where: { userId, isActive: true },
      select: { token: true, platform: true },
    });
  }
}
