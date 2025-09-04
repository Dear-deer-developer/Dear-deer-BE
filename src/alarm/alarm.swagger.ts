// src/alarm/alarm.swagger.ts

import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateAlarmDto } from './dtos/create-alarm.dto';
import { UpdateAlarmDto } from './dtos/update-alarm.dto';

export const ApiAlarm = {
  auth: () =>
    applyDecorators(
      ApiBearerAuth(), // Firebase 인증 헤더 사용
      ApiUnauthorizedResponse({ description: '인증 실패' }),
    ),

  create: () =>
    applyDecorators(
      ApiOperation({ summary: '알람 생성' }),
      ApiBody({
        description: '예약할 알람 시간(ISO 8601 포맷)',
        type: CreateAlarmDto,
        examples: {
          default: {
            summary: '예시',
            value: {
              scheduledAt: '2025-12-24T08:10:00Z',
            },
          },
        },
      }),
      ApiOkResponse({
        description: '알람 생성 성공',
        schema: {
          example: {
            id: 1,
            userId: 1,
            scheduledAt: '2025-12-24T08:10:00.000Z',
            isFired: false,
            createdAt: '2025-09-03T10:10:00.000Z',
            updatedAt: '2025-09-03T10:10:00.000Z',
          },
        },
      }),
      ApiBadRequestResponse({ description: '유효하지 않은 입력' }),
    ),

  getMy: () =>
    applyDecorators(
      ApiOperation({ summary: '본인 알람 조회' }),
      ApiOkResponse({
        description: '조회 성공',
        schema: {
          example: {
            id: 1,
            userId: 1,
            scheduledAt: '2025-12-24T08:10:00.000Z',
            isFired: false,
            createdAt: '2025-09-03T10:10:00.000Z',
            updatedAt: '2025-09-03T10:10:00.000Z',
          },
        },
      }),
      ApiNotFoundResponse({ description: '알람 없음' }),
    ),

  update: () =>
    applyDecorators(
      ApiOperation({ summary: '본인 알람 수정' }),
      ApiBody({
        description: '수정할 알람 시간',
        type: UpdateAlarmDto,
        examples: {
          default: {
            summary: '예시',
            value: {
              scheduledAt: '2025-12-25T08:30:00Z',
            },
          },
        },
      }),
      ApiOkResponse({
        description: '수정 성공',
        schema: {
          example: {
            id: 1,
            userId: 1,
            scheduledAt: '2025-12-25T08:30:00.000Z',
            isFired: false,
            createdAt: '2025-09-03T10:10:00.000Z',
            updatedAt: '2025-09-03T10:15:00.000Z',
          },
        },
      }),
      ApiNotFoundResponse({ description: '알람 없음' }),
      ApiBadRequestResponse({ description: '유효하지 않은 입력' }),
    ),

  delete: () =>
    applyDecorators(
      ApiOperation({ summary: '본인 알람 삭제' }),
      ApiOkResponse({
        description: '삭제 성공',
        schema: {
          example: {
            deleted: true,
            affected: 1,
          },
        },
      }),
      ApiNotFoundResponse({ description: '알람 없음' }),
    ),
};
