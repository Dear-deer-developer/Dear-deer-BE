import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { GiftCategoryValue } from 'src/common/enums/gift-category.enum';
import { ResGiftDto } from './dtos/res-gift.dto';
import { UpdateEquippedDto } from './dtos/update-equipped.dto';
import { CreateGiftDto } from './dtos/dev-add-my-gift.dto';
import { ResEquippedGiftDto } from './dtos/res-equipped-gift.dto';

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

  getEquipped: () =>
    applyDecorators(
      ApiOperation({ summary: '장착된 선물들 조회' }),
      ApiResponse({
        status: 200,
        type: [ResEquippedGiftDto],
        description: '현재 로그인한 사용자가 장착한 gift 목록',
      }),
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
