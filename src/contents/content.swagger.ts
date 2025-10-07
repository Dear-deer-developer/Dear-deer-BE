import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Content } from '@prisma/client';
import { CreateContentDto } from './dtos/create-content.dto';
import { UpdateContentDto } from './dtos/update-content.dto';

export const ApiContent = {
  findAll: () =>
    applyDecorators(
      ApiOperation({
        summary: '전체 콘텐츠 리스트 조회',
        description:
          '모든 사용자에게 공개된 콘텐츠 목록을 최신순으로 조회합니다.',
      }),
      ApiResponse({
        status: 200,
        description: '공개된 콘텐츠 목록 조회 성공',
        schema: {
          example: [
            {
              id: 1,
              title: '첫 번째 콘텐츠 제목',
              imageUrl: 'https://example.com/image.jpg',
              createdAt: '2025-07-01T12:00:00Z',
              subCategory: {
                id: 1,
                name: '영화/드라마',
                mainCategory: {
                  id: 1,
                  name: '콘텐츠 추천',
                },
              },
            },
          ],
        },
      }),
    ),
  findOne: () =>
    applyDecorators(
      ApiOperation({
        summary: '특정 콘텐츠 상세 조회',
        description: '특정 ID를 가진 공개된 콘텐츠의 상세 정보를 조회합니다.',
      }),
      ApiResponse({
        status: 200,
        description: '콘텐츠 상세 조회 성공',
        schema: {
          example: {
            id: 1,
            title: '첫 번째 콘텐츠 제목',
            body: '콘텐츠 본문 내용입니다.',
            imageUrl: 'https://example.com/image.jpg',
            status: 'PUBLISHED',
            createdAt: '2025-07-01T12:00:00Z',
            updatedAt: '2025-07-01T12:00:00Z',
            author: {
              id: 1,
              nickname: '관리자닉네임',
            },
            subCategory: {
              id: 5,
              name: '티켓팅/예약',
              mainCategory: {
                id: 2,
                name: '행사 알림',
              },
            },
          },
        },
      }),
      ApiResponse({
        status: 404,
        description: '게시된 콘텐츠를 찾을 수 없음',
      }),
    ),

  create: () =>
    applyDecorators(
      ApiOperation({
        summary: '관리자용 콘텐츠 등록',
        description:
          '**Firebase Admin SDK로 로그인한 관리자만 접근 가능합니다.** 콘텐츠 정보와 이미지 파일 정보를 받아 DB에 저장하고, S3 업로드를 위한 Presigned URL 목록을 반환합니다. (이미지: 최소 1장, 최대 10장)',
      }),
      ApiBearerAuth(),
      ApiBody({ type: CreateContentDto }),
      ApiResponse({
        status: 201, // POST 요청은 201 Created를 사용합니다.
        description: '콘텐츠가 성공적으로 등록되고 S3 업로드 URL이 반환됨',
        schema: {
          example: {
            contentId: 10,
            presignedUrls: [
              {
                url: 'https://s3-bucket-url.com/signed-url-for-upload-1',
                key: 'contents/1/uuid1.jpg',
              },
              {
                url: 'https://s3-bucket-url.com/signed-url-for-upload-2',
                key: 'contents/1/uuid2.png',
              },
            ],
          },
        },
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
        summary: '관리자용 콘텐츠 수정',
        description:
          '**Firebase Admin SDK로 로그인한 관리자만 접근 가능합니다.** 콘텐츠를 수정하고, 새로 업로드할 이미지가 있다면 S3 Presigned URL 목록을 반환합니다. **(중요)** `currentImageKeys`에는 수정 후 **최종적으로 남길 모든 이미지의 S3 Key**를 포함해야 합니다.',
      }),
      ApiBearerAuth(),
      ApiBody({ type: UpdateContentDto }),
      ApiResponse({
        status: 200,
        description: '콘텐츠 수정이 성공적으로 요청됨',
        schema: {
          example: {
            contentId: 10,
            presignedUrls: [
              // 새로 업로드할 이미지가 있을 경우에만 이 목록이 채워집니다.
              {
                url: 'https://s3-bucket-url.com/signed-url-for-upload-new-1',
                key: 'contents/1/uuid-new-1.jpg',
              },
            ],
          },
        },
      }),
      ApiUnauthorizedResponse({
        description: '유효하지 않은 토큰',
      }),
      ApiForbiddenResponse({
        description: '수정 권한이 없거나 관리자 권한이 필요합니다.',
      }),
      ApiResponse({
        status: 400,
        description: '유효성 검사 실패 (이미지 개수 1~10장 위반 등)',
      }),
      ApiResponse({
        status: 404,
        description: '콘텐츠를 찾을 수 없음',
      }),
    ),

  delete: () =>
    applyDecorators(
      ApiOperation({
        summary: '관리자용 콘텐츠 삭제',
        description:
          '**Firebase Admin SDK로 로그인한 관리자만 접근 가능합니다.** 지정된 콘텐츠와 관련된 DB 레코드 및 S3 파일들을 모두 삭제합니다. (작성자 본인만 삭제 가능)',
      }),
      ApiBearerAuth(),
      ApiResponse({
        status: 204,
        description: '콘텐츠 삭제 성공 (No Content)',
      }),
      ApiUnauthorizedResponse({
        description: '유효하지 않은 토큰',
      }),
      ApiForbiddenResponse({
        description: '삭제 권한이 없거나 관리자 권한이 필요합니다.',
      }),
      ApiResponse({
        status: 404,
        description: '삭제할 콘텐츠를 찾을 수 없음',
      }),
    ),
};
