import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { UpdateNicknameDto } from './dtos/update-nickname.dto';

export function SwaggerUpdateNickname() {
  return applyDecorators(
    ApiOperation({
      summary: '사용자 닉네임 설정 및 수정',
      description: '사용자의 닉네임을 설정하거나 수정합니다.',
    }),
    ApiBody({ type: UpdateNicknameDto }),
    ApiResponse({
      status: 200,
      description: '닉네임 설정/수정 완료',
      schema: {
        example: {
          id: 1,
          providerId: '123456789',
          nickname: '디어디어',
          zipCode: 10001,
          createdAt: '2025-07-01T00:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: '존재하지 않는 사용자입니다.',
      schema: {
        example: {
          statusCode: 404,
          message: '사용자를 찾을 수 없습니다.',
          error: 'Not Found',
        },
      },
    }),
    ApiBearerAuth(),
  );
}

export function SwaggerDeleteMe() {
  return applyDecorators(
    ApiOperation({
      summary: '회원 탈퇴',
      description: '현재 로그인한 사용자를 DB에서 완전히 삭제합니다.',
    }),
    ApiResponse({
      status: 204,
      description: '회원 탈퇴 성공 (No Content)',
    }),
    ApiResponse({
      status: 404,
      description: '존재하지 않는 사용자입니다.',
      schema: {
        example: {
          statusCode: 404,
          message: '사용자를 찾을 수 없습니다.',
          error: 'Not Found',
        },
      },
    }),
    ApiBearerAuth(),
  );
}

export function SwaggerGetKakaoFriends() {
  return applyDecorators(
    ApiOperation({
      summary: '카카오 친구 목록 조회',
      description: 'Firebase 인증된 사용자의 카카오 친구 목록을 조회합니다.',
    }),
    ApiResponse({
      status: 200,
      description: '카카오 친구 목록 조회 성공',
      schema: {
        example: {
          elements: [
            {
              uuid: 'deardeer123',
              profile_nickname: '김철수',
              profile_thumbnail_image: 'https://example.com/image.jpg',
            },
          ],
          total_count: 1,
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: '카카오 access token 누락 또는 유효하지 않은 경우',
    }),
    ApiBearerAuth(),
  );
}
