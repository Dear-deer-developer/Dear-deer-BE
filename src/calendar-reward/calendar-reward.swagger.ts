import { applyDecorators, HttpCode } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ResEnterCalendarDto } from './dtos/res-enter-calendar-reward.dto';
import { ResTestSantaLetterDto } from './dtos/res-test-santa-letter.dto';

export const ApiCalendarReward = {
  enter: () =>
    applyDecorators(
      ApiOperation({
        summary: '오늘의 선물 받기 (매일 1회)',
        description: `캘린더 화면 진입 시 호출합니다.
- 오늘 날짜의 선물을 지급합니다 (멱등성 보장).
- 11/1~12/24: 일반 아이템 지급 (GIFT)
- 12/25: 산타의 편지 특별 지급 (LETTER)`,
      }),
      HttpCode(200), // 👈 POST지만 멱등성이 있으므로 200 OK 반환
      ApiBearerAuth('accessToken'), // 👈 (컨트롤러에 UseGuards(AuthGuard('accessToken'))가 있으므로 필수)

      ApiResponse({
        status: 200,
        description: `선물 지급 결과 반환
- \`received: true\`: 오늘 선물을 새로 지급받음
- \`received: false\`: 이전에 이미 선물을 지급받음`,
        type: ResEnterCalendarDto, // 👈 [2] 정의한 응답 DTO 사용
      }),

      ApiResponse({
        status: 401,
        description: '인증 실패 (유효하지 않은 Access Token)',
        schema: {
          example: {
            message: 'Unauthorized',
            statusCode: 401,
          },
        },
      }),

      ApiResponse({
        status: 404,
        description: '오늘 날짜에 해당하는 보상 계획(Plan)이 없습니다.',
        schema: {
          example: {
            message: 'no reward plan',
            error: 'Not Found',
            statusCode: 404,
          },
        },
      }),
    ),

  deleteGift: () =>
    applyDecorators(
      ApiOperation({ summary: '내가 받은 gift 삭제 (개발용/관리자용)' }),
      ApiParam({ name: 'giftId', type: Number, example: 1 }),
      ApiResponse({
        status: 200,
        schema: {
          example: { success: true, giftId: 1 },
        },
      }),
    ),

  sendTestSanta: () =>
    applyDecorators(
      ApiOperation({
        summary: '산타 편지 즉시 받기 (개발용/관리자용)',
        description:
          '12월 25일을 기다리지 않고 산타 편지를 즉시 받습니다. (1회만 가능)',
      }),
      HttpCode(201),
      ApiResponse({
        status: 201,
        description: '산타 편지 발송 성공',
        type: ResTestSantaLetterDto,
      }),
      ApiResponse({
        status: 401,
        description: '인증 실패 (JWT)',
      }),
      ApiResponse({
        status: 409,
        description: '이미 산타 편지를 받음 (멱등성)',
        schema: {
          example: {
            message: '이미 산타 편지를 받았습니다. (Letter ID: 123)',
            error: 'Conflict',
            statusCode: 409,
          },
        },
      }),
      ApiBearerAuth('accessToken'),
    ),
};
