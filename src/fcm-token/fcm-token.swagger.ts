import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { RegisterFcmTokenDto } from './dtos/register-fcm-token.dto';

export const ApiFcmToken = {
  auth: () =>
    applyDecorators(
      ApiBearerAuth(), // FirebaseAuthGuard 사용 중이므로 auth 아이콘 표기를 위해
    ),

  register: () =>
    applyDecorators(
      ApiOperation({ summary: 'FCM 토큰 등록/갱신(업서트)' }),
      ApiBody({
        description: '클라이언트에서 받은 FCM 등록 토큰을 저장/갱신',
        type: RegisterFcmTokenDto,
        examples: {
          default: {
            summary: '예시',
            value: { token: 'e2f...:APA91bHx...', platform: 'IOS' },
          },
        },
      }),
      ApiOkResponse({
        description: '업서트 결과',
        schema: {
          example: { id: 123, isActive: true },
        },
      }),
      ApiBadRequestResponse({
        description: '유효하지 않은 파라미터(검증 실패 등)',
      }),
      ApiUnauthorizedResponse({ description: '인증 실패' }),
    ),

  refresh: () =>
    applyDecorators(
      ApiOperation({ summary: 'FCM 토큰 갱신(onTokenRefresh 시 동일 처리)' }),
      ApiBody({
        description: '새 토큰으로 업서트',
        type: RegisterFcmTokenDto,
        examples: {
          default: {
            summary: '예시',
            value: { token: 'e2f...:APA91bHx_new...', platform: 'ANDROID' },
          },
        },
      }),
      ApiOkResponse({
        description: '업서트 결과',
        schema: { example: { id: 123, isActive: true } },
      }),
      ApiUnauthorizedResponse({ description: '인증 실패' }),
    ),

  deactivate: () =>
    applyDecorators(
      ApiOperation({ summary: 'FCM 토큰 비활성화(로그아웃/토큰 제거)' }),
      ApiParam({
        name: 'token',
        description: '비활성화할 FCM 등록 토큰',
        example: 'e2f...:APA91bHx...',
      }),
      ApiOkResponse({
        description: '비활성화 결과',
        schema: { example: { affected: 1 } },
      }),
      ApiUnauthorizedResponse({ description: '인증 실패' }),
    ),

  // 필요 시 하드 삭제를 204로 문서화하고 싶으면 아래처럼
  hardDelete: () =>
    applyDecorators(
      ApiOperation({
        summary:
          'FCM 토큰 하드 삭제(추후 운영 정책에 따라 비활성 할 수도 있음)',
      }),
      ApiParam({
        name: 'token',
        description: '완전히 삭제할 토큰',
        example: 'e2f...:APA91bHx...',
      }),
      ApiResponse({ status: 204, description: '삭제 성공' }),
      // 대안) ApiNoContentResponse({ description: '삭제 성공' }),
      ApiUnauthorizedResponse({ description: '인증 실패' }),
    ),
};
