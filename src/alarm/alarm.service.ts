import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AlarmRepository } from './alarm.repository';
import { CreateAlarmDto } from './dtos/create-alarm.dto';
import { UpdateAlarmDto } from './dtos/update-alarm.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FirebaseAdminService } from 'src/firebase/firebase-admin.service';
import { nowKST } from 'src/common/functions/time.helper';
import { AlarmFcmPayload } from './dtos/fcm-payload.dto';

@Injectable()
export class AlarmService {
  constructor(
    private readonly alarmRepository: AlarmRepository,
    private readonly firebaseAdminService: FirebaseAdminService,
  ) {}

  async create(userId: number, dto: CreateAlarmDto) {
    const alarm = await this.alarmRepository.findOne(userId);
    if (alarm) {
      throw new ConflictException('Already exist alarm');
    }

    // 과거 시간으로 알람설정 불가
    if (new Date(dto.scheduledAt) <= nowKST()) {
      throw new BadRequestException('There is no access to past time');
    }

    return this.alarmRepository.create(userId, dto);
  }

  async findOne(userId: number) {
    const alarm = await this.alarmRepository.findOne(userId);
    if (!alarm) {
      throw new NotFoundException('Alarm not found');
    }
    return alarm;
  }

  async update(userId: number, dto: UpdateAlarmDto) {
    const alarm = await this.findOne(userId);
    return this.alarmRepository.update(alarm.userId, dto);
  }

  async delete(userId: number) {
    const alarm = await this.findOne(userId);
    return this.alarmRepository.delete(alarm.userId);
  }

  /** 발송할 알람이 있는지 매 분 검사하는 스케줄러 */
  @Cron(CronExpression.EVERY_MINUTE)
  async processAlarms() {
    const now = nowKST();
    const from = new Date(now.getTime() - 60_000); // 1분 전 ~ 지금 사이
    // 12월 24일, 25일 Cron 작동하도록 수정하면 됨 -> 주석해제 하면 적용
    // const is24or25 = now.getMonth() === 12 && [24, 25].includes(now.getDate());
    // if (!is24or25) return;

    // 조건(현재 시간 && isFired === false)에 맞는 알람이 있는지 검사
    const dueAlarms = await this.alarmRepository.findDueAlarms(from, now);

    if (!dueAlarms.length) return;

    // 여러 알람을 순회
    for (const alarm of dueAlarms) {
      const locked = await this.alarmRepository.tryMarkFiredOnce(alarm.id);
      if (locked === 0) continue;

      // 유저가 가진 토큰들 조회
      const tokens =
        alarm.user?.deviceTokens?.map((dt) => dt.token).filter(Boolean) ?? [];

      if (tokens.length === 0) {
        // 토큰이 없으면 알림 보낼 곳이 없는 상태. 로그만 남겨도 OK.
        continue;
      }

      // 전송 실패 시 재시도 큐는 추후 개발예정.....

      const dataPayload: AlarmFcmPayload = {
        type: 'ALARM',
        alarmId: String(alarm.id),
        musicId: String(alarm.musicId),
        musicTitle: alarm.music?.title ?? '',
        musicArtist: alarm.music?.artist ?? '',
        scheduledAt: alarm.scheduledAt.toISOString(),
      };

      for (const token of tokens) {
        await this.firebaseAdminService.sendFcm(
          token,
          '메리 크리스마스! 🌲',
          '지정된 시간에 도달했어요.⏰ 메리메리 크리스마스 ~',
          dataPayload,
        );
      }
    }
  }
}
