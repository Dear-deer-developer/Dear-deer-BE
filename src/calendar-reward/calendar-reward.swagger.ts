import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

export const ApiCalendarReward = {
  enter: () =>
    applyDecorators(
      ApiOperation({
        summary: '캘린더 탭 진입: 오늘 처음이면 보상 지급(멱등)',
      }),
      ApiResponse({
        status: 200,
        schema: {
          example: {
            received: true,
            localDate: '2025-10-31',
            giftId: 31,
            giftName: 'cookie',
          },
        },
      }),
      ApiResponse({
        status: 201,
        schema: {
          example: {
            received: false,
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
};
