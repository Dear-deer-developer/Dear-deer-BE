import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

export function SwaggerKakaoLogin() {
  return applyDecorators(
    ApiOperation({
      summary: '카카오 accessToken → Firebase Custom Token 발급',
    }),
    ApiBody({ schema: { example: { accessToken: '카카오 액세스 토큰' } } }),
    ApiResponse({
      status: 200,
      description: '성공',
      schema: { example: { firebaseToken: 'FIREBASE_CUSTOM_TOKEN' } },
    }),
  );
}

export function SwaggerKakaoCallback() {
  return applyDecorators(
    ApiOperation({ summary: '카카오 OAuth 콜백 → Firebase Custom Token 발급' }),
    ApiResponse({
      status: 200,
      description: '성공',
      schema: { example: { firebaseToken: 'FIREBASE_CUSTOM_TOKEN' } },
    }),
  );
}

export function SwaggerDevGetIdToken() {
  return applyDecorators(
    ApiOperation({ summary: '[개발용] Custom Token → ID Token 발급' }),
    ApiBody({ schema: { example: { customToken: 'FIREBASE_CUSTOM_TOKEN' } } }),
    ApiResponse({
      status: 200,
      description: '성공',
      schema: { example: { idToken: 'FIREBASE_ID_TOKEN' } },
    }),
  );
}

export function SwaggerWhoAmI() {
  return applyDecorators(
    ApiOperation({ summary: '내 권한 상태 확인 (관리자 여부)' }),
    ApiBearerAuth(), // Bearer ID Token 필요
    ApiResponse({
      status: 200,
      description: '성공',
      schema: { example: { uid: 'abcd1234', userId: 1, isAdmin: true } },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized(토큰 없음/유효하지 않음)',
    }),
  );
}

export function SwaggerLogout() {
  return applyDecorators(
    ApiOperation({ summary: '로그아웃(서버 측 세션 무효화)' }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: '성공',
      schema: { example: { message: '로그아웃 처리되었습니다.' } },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized(토큰 없음/유효하지 않음)',
    }),
  );
}
