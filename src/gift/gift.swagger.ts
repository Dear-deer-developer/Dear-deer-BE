import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { GiftCategoryValue } from 'src/common/enums/gift-category.enum';
import { ResGiftDto } from './dtos/res-gift.dto';
import { CreateGiftDto } from './dtos/create-gift.dto';
import { UpdateGiftDto } from './dtos/update-gift.dto';

export const ApiGifts = {
  create: () =>
    applyDecorators(
      ApiOperation({ summary: '새 gift 추가' }),
      ApiBody({
        description: '선물 데이터 생성에 필요한 정보',
        type: CreateGiftDto,
      }),
      ApiResponse({
        status: 201,
        description: 'gift 생성 성공',
        type: ResGiftDto,
      }),
    ),
  findAll: () =>
    applyDecorators(
      ApiOperation({ summary: '전체 gift 조회' }),
      ApiResponse({ status: 200, type: [ResGiftDto] }),
    ),

  findOne: () =>
    applyDecorators(
      ApiOperation({ summary: 'gift 단일 조회' }),
      ApiParam({ name: 'id', type: Number, example: 1 }),
      ApiResponse({ status: 200, type: ResGiftDto }),
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

  update: () =>
    applyDecorators(
      ApiOperation({ summary: 'gift 수정' }),
      ApiParam({ name: 'id', type: Number, example: 1 }),
      ApiBody({
        description: '선물 데이터 수정에 필요한 정보',
        type: UpdateGiftDto,
      }),
      ApiResponse({ status: 200, type: ResGiftDto }),
    ),

  remove: () =>
    applyDecorators(
      ApiOperation({ summary: 'gift 삭제' }),
      ApiParam({ name: 'id', type: Number, example: 1 }),
      ApiResponse({ status: 204, description: '삭제 성공' }),
    ),
};
