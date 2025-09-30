import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAlarmDto } from './dtos/create-alarm.dto';
import { UpdateAlarmDto } from './dtos/update-alarm.dto';

@Injectable()
export class AlarmRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: number, dto: CreateAlarmDto) {
    return this.prisma.alarm.create({
      data: {
        userId,
        scheduledAt: new Date(dto.scheduledAt),
        musicId: dto.musicId,
      },
    });
  }

  // 나의 userId 로 알람 조회  ( 여기의 userId 도 Unique로 바꿔야 하는지 )
  findOne(userId: number) {
    return this.prisma.alarm.findFirst({
      where: { userId },
      include: { music: true },
    });
  }

  update(userId: number, dto: UpdateAlarmDto) {
    return this.prisma.alarm.update({
      where: { userId },
      // scheduledAt의 값이 있다면, 입력받은 scheduledAt 값으로 업데이트
      data: {
        ...(dto.scheduledAt && {
          scheduledAt: new Date(dto.scheduledAt),
        }),
        ...(dto.musicId && { musicId: dto.musicId }),
      },
      include: { music: true },
    });
  }

  delete(userId: number) {
    return this.prisma.alarm.delete({ where: { userId } });
  }

  // 같은 분(minute)에 걸린 알람 전부 조회 (음악 포함)
  findDueAlarms(from: Date, to: Date) {
    return this.prisma.alarm.findMany({
      where: {
        scheduledAt: { gt: from, lte: to },
        isFired: false,
      },
      include: {
        user: { include: { deviceTokens: true } },
        music: true, // 음악 메타 데이터
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  // 아직 안 쏜(isFired=false) 건만 true로 바꾸고 카운트 반환
  async tryMarkFiredOnce(id: number) {
    const result = await this.prisma.alarm.updateMany({
      where: { id, isFired: false },
      data: { isFired: true },
    });
    return result.count; // 1이면 성공(선점), 0이면 이미 다른 프로세스가 처리
  }
}
