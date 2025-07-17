import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { CreateScheduleDto } from './dtos/create-schedule.dto';
import { UpdateScheduleDto } from './dtos/update-schedule.dto';
import { ApiSchedules } from './schedule.swagger';

@Controller('schedules')
@ApiTags('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  /** 월별 일정 조회 */
  @Get('monthly')
  @ApiSchedules.getMonthly()
  @UseGuards(FirebaseAuthGuard)
  async getMonthlySchedules(
    @Query('year') year: string,
    @Query('month') month: string,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.scheduleService.getMonthlySchedules(userId, +year, +month);
  }

  /** 일별 일정 조회 */
  @Get('daily')
  @ApiSchedules.getDaily()
  @UseGuards(FirebaseAuthGuard)
  async getDailySchedules(
    @Query('date') date: string, // YYYY-MM-DD
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.scheduleService.getDailySchedules(userId, new Date(date));
  }

  /** 일정 추가 */
  @Post()
  @ApiSchedules.create()
  @UseGuards(FirebaseAuthGuard)
  async createSchedule(
    @Body() createScheduleDto: CreateScheduleDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.scheduleService.createSchedule(userId, createScheduleDto);
  }

  /** 일정 수정 */
  @Patch(':scheduleId')
  @ApiSchedules.update()
  @UseGuards(FirebaseAuthGuard)
  async updateSchedule(
    @Param('scheduleId') scheduleId: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.scheduleService.updateSchedule(
      userId,
      +scheduleId,
      updateScheduleDto,
    );
  }

  /** 일정 삭제 */
  @Delete(':scheduleId')
  @HttpCode(204)
  @ApiSchedules.delete()
  @UseGuards(FirebaseAuthGuard)
  async deleteSchedule(
    @Param('scheduleId') scheduleId: string,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    this.scheduleService.deleteSchedule(userId, +scheduleId);
  }
}
