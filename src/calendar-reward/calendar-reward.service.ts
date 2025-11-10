import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CalendarRewardRepository } from './calendar-reward.repository';
import { DateTime } from 'luxon';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { LetterStatusValue } from 'src/common/enums/letter-status.enum';
import {
  APP_LAUNCH_DATE,
  CHRISTMAS_PAPER_ID,
  EVENT_START_DATE,
  EVENT_TZ,
  SANTA_LETTER_CONTENT,
  SANTA_PROVIDER_ID,
  SANTA_TRIGGER_GIFT_NAME,
} from './calender-reward.constants';
import { ResEnterCalendarDto } from './dtos/res-enter-calendar-reward.dto';
import { ResTestSantaLetterDto } from './dtos/res-test-santa-letter.dto';

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
  async enterAndMaybeGrant(userId: number): Promise<ResEnterCalendarDto> {
    const todayYmd = this.todayYmd();
    const todayDate = this.dateYmdToDateObject(todayYmd);

    // 1. 오늘 날짜의 보상 계획 조회
    const plan = await this.calendarRewardRepository.findPlanByDate(todayDate);
    if (!plan) {
      throw new NotFoundException('no reward plan');
    }

    // 12월 25일 "산타의 편지" 선물 이벤트
    if (plan.gift.name === SANTA_TRIGGER_GIFT_NAME) {
      // "산타 편지 발송" 로직을 실행 (이 함수는 자체적으로 멱등성을 가짐)
      const santaLetterResult = await this.sendSantaLetterOnce(userId);

      if (santaLetterResult.received) {
        // (성공)
        return {
          received: true,
          rewardType: 'LETTER',
          localDate: todayYmd,
          giftName: plan.gift.name,
          letter: {
            // 👈 [수정] DTO 구조에 맞게 중첩
            id: santaLetterResult.letter.id,
            senderId: santaLetterResult.letter.senderId,
          },
        };
      } else {
        // (이미 받음)
        return {
          rewardType: 'LETTER',
          received: false,
        };
      }
    }

    // 이미 수령했는지 확인
    const existing =
      await this.calendarRewardRepository.findRecordByUserAndDate(
        userId,
        todayDate,
      );
    if (existing) {
      return {
        rewardType: 'GIFT',
        received: false,
      };
    }

    // 생성 시 동시 요청이 있더라도 PK 충돌만 캐치하면 멱등
    try {
      const claim =
        await this.calendarRewardRepository.createRecordAndEnsureInventory(
          userId,
          todayDate,
          plan.gift.id,
        );
      return {
        rewardType: 'GIFT',
        received: true,
        localDate: todayYmd,
        giftId: plan.gift.id,
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

  /** 산타편지를 유저에게 전송 */
  private async sendSantaLetterOnce(receiverId: number): Promise<{
    received: boolean;
    letter?: {
      id: number;
      senderId: number;
    };
  }> {
    // 1. "산타" 유저 조회
    const santaUser = await this.prisma.user.findUnique({
      where: { providerId: SANTA_PROVIDER_ID },
    });
    if (!santaUser) {
      throw new Error('산타 유저가 시드되지 않았습니다!');
    }

    // 2. 이 유저가 이미 산타 편지를 받았는지 확인 (멱등성 체크)
    const existingLetter = await this.prisma.letter.findFirst({
      where: {
        senderId: santaUser.id,
        receiverId: receiverId,
        paperId: CHRISTMAS_PAPER_ID,
      },
    });

    // 3. 이미 편지를 받았다면, 그냥 "이미 받음" 처리
    if (existingLetter) {
      return { received: false };
    }

    try {
      const newLetter = await this.prisma.letter.create({
        data: {
          senderId: santaUser.id,
          receiverId: receiverId,
          content: SANTA_LETTER_CONTENT,
          paperId: CHRISTMAS_PAPER_ID,
          status: LetterStatusValue.SENT,
          sentAt: new Date(),
        },
      });

      // 4. 클라이언트에게 특별 응답 전송
      return {
        received: true,
        letter: {
          id: newLetter.id,
          senderId: santaUser.id, // 👈 [변경] senderId (산타 ID) 반환
        },
      };
    } catch (e) {
      // (예: 동시 요청으로 create 충돌 시)
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        return { received: false };
      }
      throw e;
    }
  }

  /**
   * 신규 유저 회원가입 시, 기본 선물 일괄 지급 (1회성)
   * authNative Service에서 호출
   */
  async grantGiftsForNewUser(userId: number) {
    const startDate = this.dateYmdToDateObject(EVENT_START_DATE); // 시작날짜
    const beforeDate = this.dateYmdToDateObject(APP_LAUNCH_DATE); // 출시날짜

    // 1. (11/1 ~ 11/11)까지의 모든 'GIFT' 선물 계획 조회
    const historicalPlans =
      await this.calendarRewardRepository.findHistoricalPlans(
        startDate,
        beforeDate,
      );

    if (historicalPlans.length === 0) {
      console.log(`No historical gifts to grant for new user ${userId}.`);
      return;
    }

    // 2. [트랜잭션] 누락된 선물(N개)을 한꺼번에 지급
    try {
      await this.calendarRewardRepository.bulkGrantGiftsForNewUser(
        userId,
        historicalPlans,
      );

      console.log(
        `Successfully granted ${historicalPlans.length} historical gifts to new user ${userId}.`,
      );
    } catch (e) {
      // 중요: 이 로직이 실패해도 회원가입이 롤백되면 안 됨.
      // 에러를 로깅만 하고, 상위 서비스(AuthService)로 throw하지 않음.
      console.error(
        `[CRITICAL] Failed to grant historical gifts for new user ${userId}`,
        e,
      );
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

  // 산타편지 테스트용
  async sendTestSantaLetter(userId: number): Promise<ResTestSantaLetterDto> {
    const result = await this.sendSantaLetterOnce(userId);

    // 멱등성: 이미 받았다면 에러
    if (!result.received) {
      throw new ConflictException(`이미 산타 편지를 받았습니다.`);
    }

    // 새로 받았다면 성공 응답
    return {
      success: true,
      letterId: result.letter.id,
      senderId: result.letter.senderId,
    };
  }
}
