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
            awarded: true,
            localDate: '2025-11-07',
            giftId: 123,
            giftName: 'ball_1',
            awardedAt: '2025-11-07T00:00:00.000Z',
          },
        },
      }),
    ),

  deleteGift: () =>
    applyDecorators(
      ApiOperation({ summary: '내가 받은 gift 삭제 (개발용)' }),
      ApiParam({ name: 'giftId', type: Number, example: 1 }),
      ApiResponse({
        status: 200,
        schema: {
          example: { success: true, giftId: 1 },
        },
      }),
    ),
};
