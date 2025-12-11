import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateContentDto } from './dtos/create-content.dto';
import { UpdateContentDto } from './dtos/update-content.dto';
import { ContentListItemDto } from './dtos/content-list-item.dto';
import { ContentDetailDto } from './dtos/content-detail.dto';
import { ContentStatus } from '@prisma/client';

export const ApiContent = {
  findAll: () =>
    applyDecorators(
      ApiOperation({
        summary: '콘텐츠 리스트 조회 (로그인 필수)',
        description:
          '**로그인한 사용자만** 접근 가능합니다. \n\n 공개된(PUBLISHED) 콘텐츠 목록을 최신순으로 조회합니다.',
      }),
      ApiBearerAuth('accessToken'),
      ApiResponse({
        status: 200,
        description: '공개된 콘텐츠 목록 조회 성공',
        type: [ContentListItemDto],
      }),
      ApiUnauthorizedResponse({ description: '인증되지 않은 사용자입니다.' }),
    ),

  findOne: () =>
    applyDecorators(
      ApiOperation({
        summary: '특정 콘텐츠 상세 조회 (로그인 필수)',
        description:
          '**로그인한 사용자만** 접근 가능합니다. \n\n `isScrapped` (스크랩 여부) 필드가 **항상** 포함됩니다.',
      }),
      ApiBearerAuth('accessToken'),
      ApiResponse({
        status: 200,
        description: '콘텐츠 상세 조회 성공',
        type: ContentDetailDto,
      }),
      ApiNotFoundResponse({
        description: '게시된 콘텐츠를 찾을 수 없음',
      }),
      ApiUnauthorizedResponse({ description: '인증되지 않은 사용자입니다.' }),
    ),

  findAllForAdmin: () =>
    applyDecorators(
      ApiOperation({
        summary: '(관리자) 콘텐츠 목록 조회',
        description:
          '**관리자만 접근 가능합니다.** \n\n `status` 쿼리(WRITING, PUBLISHED, HIDDEN)로 필터링된 콘텐츠 목록을 조회합니다.',
      }),
      ApiBearerAuth('accessToken'),
      ApiQuery({
        name: 'status',
        required: false,
        enum: ContentStatus,
        description: '필터링할 상태 (WRITING, PUBLISHED, HIDDEN)',
      }),
      ApiResponse({
        status: 200,
        description: '관리자용 콘텐츠 목록 조회 성공',
        type: [ContentListItemDto],
      }),
      ApiUnauthorizedResponse({ description: '유효하지 않은 토큰' }),
      ApiForbiddenResponse({ description: '관리자 권한이 필요합니다.' }),
    ),

  findOneForAdmin: () =>
    applyDecorators(
      ApiOperation({
        summary: '(관리자) 콘텐츠 상세 조회',
        description:
          '**관리자만 접근 가능합니다.** \n\n `status`에 관계없이 특정 ID의 콘텐츠 상세 정보를 조회합니다.',
      }),
      ApiBearerAuth('accessToken'),
      ApiResponse({
        status: 200,
        description: '관리자용 콘텐츠 상세 조회 성공',
        type: ContentDetailDto,
      }),
      ApiNotFoundResponse({
        description: '콘텐츠를 찾을 수 없음',
      }),
      ApiUnauthorizedResponse({ description: '유효하지 않은 토큰' }),
      ApiForbiddenResponse({ description: '관리자 권한이 필요합니다.' }),
    ),

  create: () =>
    applyDecorators(
      ApiOperation({
        summary: '(관리자) 콘텐츠 등록',
        description:
          '**관리자만 접근 가능합니다.** \n\n `status` 필드에 `WRITING` (임시저장) 또는 `PUBLISHED` (발행)를 지정하여 콘텐츠를 등록합니다.',
      }),
      ApiBearerAuth('accessToken'),
      ApiBody({ type: CreateContentDto }),
      ApiResponse({
        status: 201,
        description:
          '콘텐츠는 기본 정보가 DB에 저장되고, 이미지 업로드용 Presigned URL 목록이 반환됨',
        schema: {
          example: {
            contentId: 10,
            presignedUrls: [
              {
                url: 'https://s3-bucket-url.com/signed-url-for-upload-1',
                key: 'contents/1/uuid1.jpg',
              },
            ],
          },
        },
      }),
      ApiBadRequestResponse({
        description: '요청 데이터가 유효하지 않음',
      }),
      ApiUnauthorizedResponse({
        description: '유효하지 않은 토큰',
      }),
      ApiForbiddenResponse({
        description: '관리자 권한이 필요합니다.',
      }),
    ),

  update: () =>
    applyDecorators(
      ApiOperation({
        summary: '(관리자) 콘텐츠 수정',
        description:
          '**관리자만 접근 가능합니다.** \n\n 콘텐츠의 `title`, `body`, `status` (WRITING, PUBLISHED, HIDDEN) 등을 수정합니다.',
      }),
      ApiBearerAuth('accessToken'),
      ApiBody({ type: UpdateContentDto }),
      ApiResponse({
        status: 200,
        description: '콘텐츠 수정이 성공적으로 요청됨',
        schema: {
          example: {
            contentId: 10,
            presignedUrls: [
              {
                url: 'https://s3-bucket-url.com/signed-url-for-upload-new-1',
                key: 'contents/1/uuid-new-1.jpg',
              },
            ],
          },
        },
      }),
      ApiBadRequestResponse({
        description: '유효성 검사 실패',
      }),
      ApiNotFoundResponse({
        description: '콘텐츠를 찾을 수 없음',
      }),
      ApiUnauthorizedResponse({
        description: '유효하지 않은 토큰',
      }),
      ApiForbiddenResponse({
        description: '수정 권한이 없거나 관리자 권한이 필요합니다.',
      }),
    ),

  delete: () =>
    applyDecorators(
      ApiOperation({
        summary: '(관리자) 콘텐츠 삭제',
        description:
          '**관리자만 접근 가능합니다.** \n\n `status`와 관계없이 지정된 콘텐츠를 삭제합니다.',
      }),
      ApiBearerAuth('accessToken'),
      ApiResponse({
        status: 204,
        description: '콘텐츠 삭제 성공 (No Content)',
      }),
      ApiNotFoundResponse({
        description: '삭제할 콘텐츠를 찾을 수 없음',
      }),
      ApiUnauthorizedResponse({
        description: '유효하지 않은 토큰',
      }),
      ApiForbiddenResponse({
        description: '삭제 권한이 없거나 관리자 권한이 필요합니다.',
      }),
    ),
};
