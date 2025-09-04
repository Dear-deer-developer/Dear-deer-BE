import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Content } from '@prisma/client';

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
                id: 1,
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
};
