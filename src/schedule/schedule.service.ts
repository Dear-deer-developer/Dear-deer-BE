import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ScheduleRepository } from './schedule.repository';
import { CreateScheduleDto } from './dtos/create-schedule.dto';
import { UpdateScheduleDto } from './dtos/update-schedule.dto';
import { ScheduleCategoryOrder } from './constants/schedule-category.constant';

@Injectable()
export class ScheduleService {
  constructor(private readonly scheduleRepository: ScheduleRepository) {}

  /** 월별 조회 */
  async getMonthlySchedules(userId: number, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    // 만약 25년 9월 선택시 → 2025-08-31T15:00:00.000Z, 2025-09-30T15:00:00.000Z 를 조회함
    // 일정 생성시 해당 날짜 00시로 생성하기 때문에 조회 이상은 없음 ( 일별 조회도 마찬가지 )

    const schedules = await this.scheduleRepository.findMonthlySchedules(
      userId,
      startDate,
      endDate,
    );

    const sortedSchedules = schedules.sort((a, b) => {
      // 1. 먼저 date 비교 (오름차순)
      const dateDiff = a.date.getTime() - b.date.getTime();
      if (dateDiff !== 0) return dateDiff;

      // 2. 같은 날짜라면 category 우선순위 비교
      return (
        ScheduleCategoryOrder[a.category] - ScheduleCategoryOrder[b.category]
      );
    });

    return sortedSchedules;
  }

  /** 일별 조회 */
  async getDailySchedules(userId: number, date: Date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const schedules = await this.scheduleRepository.findDailySchedules(
      userId,
      startDate,
      endDate,
    );

    const sortedSchedules = schedules.sort((a, b) => {
      // category 우선순위 비교
      return (
        ScheduleCategoryOrder[a.category] - ScheduleCategoryOrder[b.category]
      );
    });

    return sortedSchedules;
  }

  /** 일정 추가 */
  async createSchedule(userId: number, dto: CreateScheduleDto) {
    const date = new Date(dto.date);

    return this.scheduleRepository.createSchedule({
      ...dto,
      userId,
      date,
    });
  }

  /** 일정 수정 */
  async updateSchedule(
    userId: number,
    scheduleId: number,
    dto: UpdateScheduleDto,
  ) {
    const schedule = await this.scheduleRepository.findById(scheduleId);
    if (!schedule) throw new NotFoundException('일정을 찾을 수 없습니다.');
    if (schedule.userId !== userId)
      throw new ForbiddenException('권한이 없습니다.');

    return this.scheduleRepository.updateSchedule(scheduleId, dto);
  }

  /** 일정 삭제 */
  async deleteSchedule(userId: number, scheduleId: number) {
    const schedule = await this.scheduleRepository.findById(scheduleId);
    if (!schedule) throw new NotFoundException('일정을 찾을 수 없습니다.');
    if (schedule.userId !== userId)
      throw new ForbiddenException('권한이 없습니다.');

    return this.scheduleRepository.deleteSchedule(scheduleId);
  }
}
