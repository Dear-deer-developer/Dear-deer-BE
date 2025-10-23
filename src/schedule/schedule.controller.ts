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
  ParseIntPipe,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { CreateScheduleDto } from './dtos/create-schedule.dto';
import { UpdateScheduleDto } from './dtos/update-schedule.dto';
import { ApiSchedules } from './schedule.swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetUserId } from 'src/auth/decorators/get-user-id.decorator';

@Controller('schedules')
@UseGuards(AuthGuard('accessToken'))
@ApiTags('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  /** 월별 일정 조회 */
  @Get('monthly')
  @ApiSchedules.getMonthly()
  async getMonthlySchedules(
    @Query('year') year: string,
    @Query('month') month: string,
    @GetUserId() userId: number,
  ) {
    return this.scheduleService.getMonthlySchedules(userId, +year, +month);
  }

  /** 일별 일정 조회 */
  @Get('daily')
  @ApiSchedules.getDaily()
  async getDailySchedules(
    @Query('date') date: string, // YYYY-MM-DD
    @GetUserId() userId: number,
  ) {
    return this.scheduleService.getDailySchedules(userId, new Date(date));
  }

  /** 일정 추가 */
  @Post()
  @ApiSchedules.create()
  async createSchedule(
    @Body() createScheduleDto: CreateScheduleDto,
    @GetUserId() userId: number,
  ) {
    return this.scheduleService.createSchedule(userId, createScheduleDto);
  }

  /** 일정 수정 */
  @Patch(':scheduleId')
  @ApiSchedules.update()
  async updateSchedule(
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
    @Body() updateScheduleDto: UpdateScheduleDto,
    @GetUserId() userId: number,
  ) {
    return this.scheduleService.updateSchedule(
      userId,
      scheduleId,
      updateScheduleDto,
    );
  }

  /** 일정 삭제 */
  @Delete(':scheduleId')
  @HttpCode(204)
  @ApiSchedules.delete()
  async deleteSchedule(
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
    @GetUserId() userId: number,
  ) {
    this.scheduleService.deleteSchedule(userId, scheduleId);
  }
}
