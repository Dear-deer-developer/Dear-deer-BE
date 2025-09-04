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
      },
    });
  }

  // 나의 userId 로 알람 조회  ( 여기의 userId 도 Unique로 바꿔야 하는지 )
  findOne(userId: number) {
    return this.prisma.alarm.findFirst({ where: { userId } });
  }

  update(userId: number, dto: UpdateAlarmDto) {
    return this.prisma.alarm.update({
      where: { userId },
      // scheduledAt의 값이 있다면, 입력받은 scheduledAt 값으로 업데이트
      data: {
        ...(dto.scheduledAt && {
          scheduledAt: new Date(dto.scheduledAt),
        }),
      },
    });
  }

  delete(userId: number) {
    return this.prisma.alarm.delete({ where: { userId } });
  }

  // alarm 조회 (fcm 토큰 포함)
  async findAlarm(now: Date) {
    const alarm = await this.prisma.alarm.findFirst({
      where: {
        scheduledAt: { lte: now },
        isFired: false,
      },
      include: {
        user: {
          include: {
            deviceTokens: true,
          },
        },
      },
    });

    return alarm;
  }

  markAsFired(id: number) {
    return this.prisma.alarm.update({
      where: { id },
      data: { isFired: true },
    });
  }
}
