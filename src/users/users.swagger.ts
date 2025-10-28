import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { UpdateNicknameDto } from './dtos/update-nickname.dto';
import { FoundUserDto } from './dtos/res-user.dto';

export function SwaggerGetUser() {
  return applyDecorators(
    ApiOperation({
      summary: '사용자 정보 조회',
      description: '현재 로그인된 사용자의 상세 정보를 조회합니다.',
    }),
    ApiResponse({
      status: 200,
      description: '사용자 정보 조회 성공',
      schema: {
        example: {
          id: 1,
          nickname: '디어디어',
          zipCode: 0,
          providerId: '4000000000',
          createdAt: '2025-08-27T04:31:11.043Z',
          updatedAt: '2025-08-27T04:31:11.043Z',
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: '사용자를 찾을 수 없습니다.',
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

export function SwaggerFindUserByZipcode() {
  return applyDecorators(
    ApiOperation({
      summary: '우편번호로 사용자 검색',
      description: '우편번호로 특정 사용자 1명을 검색합니다. (본인 제외)',
    }),

    ApiResponse({
      status: 200,
      description: '사용자 검색 성공',
      type: FoundUserDto,
    }),

    ApiResponse({
      status: 400,
      description: '유효하지 않은 우편번호 (Validation Error)',
      schema: {
        example: {
          statusCode: 400,
          message: ['유효하지 않은 5자리 우편번호입니다.'],
          error: 'Bad Request',
        },
      },
    }),

    ApiResponse({
      status: 404,
      description: '해당 우편번호를 가진 사용자를 찾을 수 없습니다.',
      schema: {
        example: {
          statusCode: 404,
          message: '해당 우편번호를 가진 사용자를 찾을 수 없습니다.',
          error: 'Not Found',
        },
      },
    }),
    ApiBearerAuth(),
  );
}
