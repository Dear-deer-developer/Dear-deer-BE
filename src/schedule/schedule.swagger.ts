import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MonthlyScheduleResDto } from './dtos/monthly-schedule-res.dto';
import { DailyScheduleResDto } from './dtos/daily-schedule-res.dto';
import { CreateScheduleDto } from './dtos/create-schedule.dto';
import { UpdateScheduleDto } from './dtos/update-schedule.dto';

export const ApiSchedules = {
  getMonthly: () =>
    applyDecorators(
      ApiBearerAuth('accessToken'),
      ApiOperation({
        summary: '월별 일정 조회',
        description: '해당 연도/월의 일정들을 조회합니다.',
      }),
      ApiQuery({ name: 'year', example: '2025', required: true }),
      ApiQuery({ name: 'month', example: '7', required: true }),
      ApiResponse({
        status: 200,
        type: MonthlyScheduleResDto,
        isArray: true,
        description: '월별 일정 목록 (id, category, date만 포함)',
      }),
    ),

  getDaily: () =>
    applyDecorators(
      ApiBearerAuth('accessToken'),
      ApiOperation({
        summary: '일별 일정 조회',
        description: '해당 일자의 전체 일정 정보를 조회합니다.',
      }),
      ApiQuery({ name: 'date', example: '2025-07-23', required: true }),
      ApiResponse({
        status: 200,
        type: DailyScheduleResDto,
        isArray: true,
        description: '일별 일정 목록 (전체 필드)',
      }),
    ),

  create: () =>
    applyDecorators(
      ApiBearerAuth('accessToken'),
      ApiOperation({
        summary: '일정 추가',
        description: '새 일정을 추가합니다.',
      }),
      ApiBody({ type: CreateScheduleDto }),
      ApiResponse({
        status: 201,
        type: DailyScheduleResDto,
        description: '추가된 일정 정보',
      }),
    ),

  update: () =>
    applyDecorators(
      ApiBearerAuth('accessToken'),
      ApiOperation({
        summary: '일정 수정',
        description: '기존 일정을 수정합니다.',
      }),
      ApiBody({ type: UpdateScheduleDto }),
      ApiResponse({
        status: 200,
        type: DailyScheduleResDto,
        description: '수정된 일정 정보',
      }),
      ApiResponse({
        status: 404,
        description: '존재하지 않는 일정',
      }),
    ),

  delete: () =>
    applyDecorators(
      ApiBearerAuth('accessToken'),
      ApiOperation({ summary: '일정 삭제', description: '일정을 삭제합니다.' }),
      ApiResponse({
        status: 204,
        description: '성공적으로 삭제됨 (No Content)',
      }),
      ApiResponse({
        status: 404,
        description: '존재하지 않는 일정',
      }),
    ),
};
