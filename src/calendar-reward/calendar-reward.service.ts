import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CalendarRewardRepository } from './calendar-reward.repository';
import { DateTime } from 'luxon';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

const EVENT_TZ = 'Asia/Seoul';

@Injectable()
export class CalendarRewardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly calendarRewardRepository: CalendarRewardRepository,
  ) {}

  /** 'YYYY-MM-DD' -> Date(@db.Date 컬럼에 저장할 값) */
  private dateYmdToDateObject(ymd: string): Date {
    // new Date('YYYY-MM-DD')는 UTC 자정 Date가 되서 UTC 00시 00분 으로 인식하고
    // DB에 넣을땐 YYYY-MM-DD 데이터만 저장됨 (@db.Date 속성 때문에)
    return new Date(ymd);
  }

  /** 이벤트 타임존 기준 오늘의 YYYY-MM-DD */
  private todayYmd(): string {
    return DateTime.now().setZone(EVENT_TZ).startOf('day').toISODate()!;
  }

  /** 오늘 첫 진입이면 지급(멱등). 이미 수령했다면 received=false */
  async enterAndMaybeGrant(userId: number) {
    const todayYmd = this.todayYmd();
    const todayDate = this.dateYmdToDateObject(todayYmd);

    const plan = await this.calendarRewardRepository.findPlanByDate(todayDate);
    if (!plan) {
      throw new NotFoundException('no reward plan');
    }

    // 이미 수령했는지 확인
    const existing =
      await this.calendarRewardRepository.findRecordByUserAndDate(
        userId,
        todayDate,
      );
    if (existing) {
      return {
        received: false,
      };
    }

    // 생성 시 동시 요청이 있더라도 PK 충돌만 캐치하면 멱등
    try {
      const claim =
        await this.calendarRewardRepository.createRecordAndEnsureInventory(
          userId,
          todayDate,
          plan.giftId,
        );
      return {
        received: true,
        localDate: todayYmd,
        giftId: plan.giftId,
        giftName: plan.gift.name,
      };
    } catch (e) {
      // 동시 요청 등으로 인한 PK 충돌 => 이미 수령 했기 때문에 충돌 에러 던짐
      // Prisma.PrismaClientKnownRequestError는 유니크 제약 에러
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('already-received');
      }
      // 이외의 에러라면 그냥 throw e
      throw e;
    }
  }

  // 개발용 메서드 (배포시 삭제)
  async deleteGiftAndRecord(userId: number, giftId: number) {
    return this.prisma.$transaction(async (tx) => {
      // 1) user_gifts에서 삭제
      const deletedGift = await tx.userGift.deleteMany({
        where: { userId, giftId },
      });

      if (deletedGift.count === 0) {
        throw new NotFoundException('해당 선물을 보유하고 있지 않습니다.');
      }

      // 2) calendar_reward_records에서 삭제
      await tx.calendarRewardRecord.deleteMany({
        where: { userId, giftId },
      });

      return { success: true, giftId };
    });
  }
}
