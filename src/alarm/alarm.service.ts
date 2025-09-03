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
    // 12월 24일, 25일 Cron 작동하도록 수정하면 됨 -> 주석해제 하면 적용
    // const is24or25 = now.getMonth() === 12 && [24, 25].includes(now.getDate());
    // if (!is24or25) return;

    // 조건(현재 시간 && isFired === false)에 맞는 알람이 있는지 검사
    const alarm = await this.alarmRepository.findAlarm(now);

    if (!alarm) return;

    // 하나의 알람에 여러 디바이스 토큰이 있는지 검사
    const tokens =
      alarm.user?.deviceTokens?.map((dt) => dt.token).filter(Boolean) ?? [];

    // 한 유저의 모든 디바이스로 알람 발송
    for (const token of tokens) {
      // 알림 내용은 여기서 수정하면 됨
      await this.firebaseAdminService.sendFcm(
        token,
        '알람 도착!',
        '지정된 시간에 도달했어요 ⏰',
      );

      // 전송된 알람은 isFired 상태 false -> true 로 변경
      await this.alarmRepository.markAsFired(alarm.id);
    }
  }
}
