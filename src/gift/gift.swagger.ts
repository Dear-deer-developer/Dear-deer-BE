import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { GiftCategoryValue } from 'src/common/enums/gift-category.enum';
import { ResGiftDto } from './dtos/res-gift.dto';

export const ApiGifts = {
  findMine: () =>
    applyDecorators(
      ApiOperation({ summary: '내가 가진 gifts 조회' }),
      ApiResponse({
        status: 200,
        type: [ResGiftDto],
        description: '현재 로그인한 사용자가 보유한 gift 목록',
      }),
    ),
  findAll: () =>
    applyDecorators(
      ApiOperation({ summary: '전체 gift 조회' }),
      ApiResponse({ status: 200, type: [ResGiftDto] }),
    ),

  findByCategory: () =>
    applyDecorators(
      ApiOperation({ summary: '카테고리별 gift 조회' }),
      ApiParam({
        name: 'category',
        enum: GiftCategoryValue,
        example: 'ORNAMENT',
      }),
      ApiResponse({ status: 200, type: [ResGiftDto] }),
    ),
};
