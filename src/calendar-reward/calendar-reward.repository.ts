import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CalendarRewardRepository {
  constructor(private readonly prisma: PrismaService) {}

  // 오늘 계획 1건
  async findPlanByDate(localDate: Date) {
    return this.prisma.calendarRewardPlan.findUnique({
      where: { localDate },
      select: {
        localDate: true,
        giftId: true,
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
}
