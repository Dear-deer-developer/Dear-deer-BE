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
