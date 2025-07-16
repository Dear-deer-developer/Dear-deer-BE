import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Schedule } from '@prisma/client';
import { MonthlyScheduleResDto } from './dtos/monthly-schedule-res.dto';

@Injectable()
export class ScheduleRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** 일정 생성 */
  createSchedule(data: Prisma.ScheduleUncheckedCreateInput): Promise<Schedule> {
    return this.prisma.schedule.create({ data });
  }

  /** 일정 수정 */
  updateSchedule(
    id: number,
    data: Prisma.ScheduleUncheckedUpdateInput,
  ): Promise<Schedule> {
    return this.prisma.schedule.update({
      where: { id },
      data,
    });
  }

  /** 일정 삭제 */
  deleteSchedule(id: number): Promise<Schedule> {
    return this.prisma.schedule.delete({
      where: { id },
    });
  }

  /** 일정 단건 조회 */
  findById(id: number): Promise<Schedule | null> {
    return this.prisma.schedule.findUnique({
      where: { id },
    });
  }

  /** 월별 일정 목록 조회 */
  findMonthlySchedules(
    userId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<MonthlyScheduleResDto[]> {
    return this.prisma.schedule.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        category: true,
        date: true,
      },
    });
  }

  /** 일별 일정 목록 조회 */
  findDailySchedules(
    userId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<Schedule[]> {
    return this.prisma.schedule.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  }
}
