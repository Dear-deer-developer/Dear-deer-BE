// 파일명: src/scrap/scrap.swagger.ts
import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { MyScrapDto } from './dtos/my-scrap.dto';

export const ApiScrap = {
  createScrap: () =>
    applyDecorators(
      ApiOperation({
        summary: '콘텐츠 스크랩 (좋아요)',
        description: '특정 콘텐츠를 스크랩합니다.',
      }),
      ApiBearerAuth('accessToken'),
      ApiResponse({
        status: 201,
        description: '스크랩 성공',
        schema: {
          example: { message: '스크랩되었습니다.' },
        },
      }),
      ApiResponse({
        status: 401,
        description: '인증되지 않은 사용자입니다.',
      }),
      ApiResponse({
        status: 404,
        description: '게시된 콘텐츠를 찾을 수 없습니다.',
      }),
      ApiResponse({
        status: 409,
        description: '이미 스크랩한 콘텐츠입니다.',
      }),
    ),

  deleteScrap: () =>
    applyDecorators(
      ApiOperation({
        summary: '콘텐츠 스크랩 취소 (좋아요 취소)',
        description: '스크랩했던 콘텐츠를 취소합니다.',
      }),
      ApiBearerAuth('accessToken'),
      ApiResponse({
        status: 204,
        description: '스크랩 취소 성공 (No Content)',
      }),
      ApiResponse({
        status: 401,
        description: '인증되지 않은 사용자입니다.',
      }),
      ApiResponse({
        status: 404,
        description: '스크랩한 기록을 찾을 수 없습니다.',
      }),
    ),

  findMyScraps: () =>
    applyDecorators(
      ApiOperation({
        summary: '내 스크랩 목록 조회',
        description: '내가 스크랩한 모든 콘텐츠 목록을 최신순으로 조회합니다.',
      }),
      ApiBearerAuth('accessToken'),
      ApiResponse({
        status: 200,
        description: '내 스크랩 목록 조회 성공',
        type: [MyScrapDto],
      }),
      ApiResponse({
        status: 401,
        description: '인증되지 않은 사용자입니다.',
      }),
    ),
};
