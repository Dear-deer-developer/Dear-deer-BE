import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FoundUserDto } from './dtos/res-user.dto';
import { User } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProviderId(providerId: string) {
    return this.prisma.user.findUnique({
      where: { providerId },
    });
  }

  async createUser(data: {
    providerId: string;
    nickname: string;
    zipCode: number;
  }) {
    return this.prisma.user.create({ data });
  }

  async findById(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        zipCode: true,
        loginType: true,
        providerId: true,
        isAdmin: true,
      },
    });
  }

  // new 아이템 조회할때 사용
  async findUserForNewGiftCheck(
    userId: number,
  ): Promise<{ lastGiftViewedAt: Date | null } | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        lastGiftViewedAt: true,
      },
    });
  }

  // 나의 아이템 조회 후 사용
  async updateLastGiftViewed(userId: number, time: Date): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lastGiftViewedAt: time },
    });
  }

  async updateNickname(userId: number, nickname: string, zipCode: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { nickname, zipCode },
    });
  }

  /**
   * 우편번호가 일치하는 사용자 목록 조회 (본인 제외)
   */
  async findUserByZipCode(
    zipCode: number,
    myId: number,
  ): Promise<FoundUserDto> {
    return this.prisma.user.findFirst({
      where: {
        zipCode: zipCode, // 1. 우편번호 일치
        NOT: {
          id: myId, // 2. 본인 ID 제외
        },
      },
      select: {
        id: true,
        nickname: true,
      },
    });
  }
}
