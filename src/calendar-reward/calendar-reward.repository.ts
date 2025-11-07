import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SANTA_TRIGGER_GIFT_NAME } from './calender-reward.constants';

@Injectable()
export class CalendarRewardRepository {
  constructor(private readonly prisma: PrismaService) {}

  // 오늘 계획 1건
  async findPlanByDate(localDate: Date) {
    return this.prisma.calendarRewardPlan.findUnique({
      where: { localDate },
      select: {
        localDate: true,
        gift: { select: { id: true, name: true } },
      },
    });
  }

  // 오늘 이미 수령했는지
  async findRecordByUserAndDate(userId: number, localDate: Date) {
    return this.prisma.calendarRewardRecord.findUnique({
      where: { userId_localDate: { userId, localDate } },
    });
  }

  // 수령 + 인벤토리 반영 (트랜잭션)
  async createRecordAndEnsureInventory(
    userId: number,
    localDate: Date,
    giftId: number,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 유저가 해당 선물을 이미 가지고 있어도 멱등
      await tx.userGift.upsert({
        where: { userId_giftId: { userId, giftId } },
        create: { userId, giftId },
        update: {},
      });

      // 하루 1회: (userId, localDate) PK
      return tx.calendarRewardRecord.create({
        data: { userId, localDate, giftId },
      });
    });
  }

  // 아래는 앱 출시가 늦어지면서 추가된 메서드들입니다.

  /**
   * 출시 날짜 '이전'까지의 모든 'GIFT' 보상 계획을 조회합니다.
   * (신규 유저 가입 시 1회성 지급용)
   */
  async findHistoricalPlans(startDate: Date, beforeDate: Date) {
    return this.prisma.calendarRewardPlan.findMany({
      where: {
        localDate: {
          gte: startDate, // 시작 날짜
          lt: beforeDate, // 끝 날짜보다 작은
        },
        gift: {
          name: {
            not: SANTA_TRIGGER_GIFT_NAME, // (혹시 모를 산타 편지 트리거 제외)
          },
        },
      },
      select: {
        localDate: true,
        giftId: true,
      },
    });
  }

  /**
   * 신규 유저에게 여러 개의 선물을 트랜잭션으로 일괄 지급합니다.
   * (UserGift와 CalendarRewardRecord에 동시 생성)
   */
  async bulkGrantGiftsForNewUser(
    userId: number,
    gifts: { localDate: Date; giftId: number }[],
  ) {
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      // 1. CalendarRewardRecord에 일괄 삽입
      await tx.calendarRewardRecord.createMany({
        data: gifts.map((g) => ({
          userId: userId,
          localDate: g.localDate,
          giftId: g.giftId,
          receivedAt: now,
        })),
      });

      // 2. UserGift에 일괄 삽입
      await tx.userGift.createMany({
        data: gifts.map((g) => ({
          userId: userId,
          giftId: g.giftId,
          obtainedAt: now,
        })),
        skipDuplicates: true, // (혹시 모를 중복 방지)
      });
    });
  }
}
