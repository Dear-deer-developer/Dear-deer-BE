import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GiftCategoryValue } from 'src/common/enums/gift-category.enum';
import { ResGiftDto } from './dtos/res-gift.dto';
import { UpdateEquippedDto } from './dtos/update-equipped.dto';
import { CreateGiftDto } from './dtos/dev-add-my-gift.dto';
import { ResEquippedGiftDto } from './dtos/res-equipped-gift.dto';
import { ResMyGiftDto } from './dtos/res-my-gift.dto';

export const ApiGifts = {
  findMine: () =>
    applyDecorators(
      ApiOperation({ summary: '내가 가진 gifts 조회' }),
      ApiResponse({
        status: 200,
        type: [ResMyGiftDto],
        description: '현재 로그인한 사용자가 보유한 gift 목록',
      }),
      ApiBearerAuth('accessToken'),
    ),

  updateLastGiftViewed: () =>
    applyDecorators(
      ApiOperation({
        summary: '선물함 "NEW" 배지 제거 (확인 처리)',
        description: `선물함을 확인했음을 서버에 알려 User의 'lastGiftViewedAt'을 갱신합니다.
이 API 호출 이후 '내가 가진 gifts 조회' API를 호출하면, 갱신된 시간을 기준으로 'isNew'가 계산됩니다.`,
      }),
      ApiBearerAuth('accessToken'), // 👈 AuthGuard('accessToken')가 있으므로 명시

      ApiResponse({
        status: 200,
        description: '선물함 확인 시간 갱신 성공',
        schema: {
          example: { success: true },
        },
      }),
      ApiResponse({
        status: 401,
        description: '인증 실패 (Unauthorized)',
        schema: {
          example: { message: 'Unauthorized', statusCode: 401 },
        },
      }),
    ),

  getEquipped: () =>
    applyDecorators(
      ApiOperation({ summary: '장착된 선물들 조회' }),
      ApiResponse({
        status: 200,
        type: [ResEquippedGiftDto],
        description: '현재 로그인한 사용자가 장착한 gift 목록',
      }),
      ApiBearerAuth('accessToken'),
    ),

  updateEquipped: () =>
    applyDecorators(
      ApiOperation({ summary: '최종 장착 상태로 업데이트' }),
      ApiBody({ type: UpdateEquippedDto }),
      ApiResponse({
        status: 200,
        type: [ResEquippedGiftDto],
        description: '성공적으로 업데이트된 후의 최종 장착 목록',
      }),
      ApiBearerAuth('accessToken'),
    ),

  findAll: () =>
    applyDecorators(
      ApiOperation({ summary: '전체 gift 조회 (개발용/관리자용)' }),
      ApiResponse({ status: 200, type: [ResGiftDto] }),
    ),

  findByCategory: () =>
    applyDecorators(
      ApiOperation({ summary: '카테고리별 gift 조회 (개발용/관리자용)' }),
      ApiParam({
        name: 'category',
        enum: GiftCategoryValue,
        example: 'ORNAMENT',
      }),
      ApiResponse({ status: 200, type: [ResGiftDto] }),
    ),

  addMyGift: () =>
    applyDecorators(
      ApiOperation({ summary: '내가 가진 선물 추가 (개발용/관리자용)' }),
      ApiBody({ type: CreateGiftDto }),
      ApiResponse({
        status: 201,
        description: '성공적으로 인벤토리에 추가됨. (개발용)',
      }),
    ),

  deleteMyGift: () =>
    applyDecorators(
      ApiOperation({ summary: '내가 가진 선물 삭제 (개발용/관리자용)' }),
      ApiParam({
        name: 'giftId',
        type: Number,
        description: '인벤토리에서 삭제할 선물의 ID',
      }),
      ApiResponse({
        status: 204,
        description: '성공적으로 인벤토리에서 삭제됨. (개발용)',
      }),
    ),
};
