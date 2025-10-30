import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiHeaders,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { TokenResponseDto } from './dtos/token-res.dto';
import { AuthLoginDto } from './dtos/auth-login.dto';
import { AuthRegisterDto } from './dtos/auth-register.dto';
import { ResCheckNicknameDto } from './dtos/res-check-nickname.dto';

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
    ApiOperation({ summary: 'Custom Token → ID Token 발급 (개발용)' }),
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
    ApiOperation({
      summary: '내 권한 상태 확인 (관리자 여부)- 파베토큰 검증용 API 입니다!',
    }),
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

export const ApiAuthNative = {
  /**
   * @summary 네이티브 계정 회원가입 Swagger 데코레이터
   */
  register: () =>
    applyDecorators(
      ApiOperation({
        summary: '[네이티브] 회원가입',
        description:
          '이메일, 비밀번호, 닉네임으로 서비스에 가입하고 토큰을 발급받습니다.',
      }),
      ApiBody({ type: AuthRegisterDto }),
      ApiResponse({
        status: 201,
        description: '회원가입 성공',
        type: TokenResponseDto,
      }),
      ApiResponse({
        status: 409,
        description: '이미 사용 중인 이메일 또는 닉네임',
        schema: {
          example: {
            message: '이미 사용 중인 이메일입니다.',
            error: 'Conflict',
            statusCode: 409,
          },
        },
      }),
    ),

  /**
   * @summary 네이티브 계정 로그인 Swagger 데코레이터
   */
  login: () =>
    applyDecorators(
      ApiOperation({
        summary: '[네이티브] 로그인',
        description:
          '이메일과 비밀번호로 로그인하고 새로운 Access/Refresh 토큰을 발급받습니다.',
      }),
      ApiBody({ type: AuthLoginDto }),
      ApiResponse({
        status: 200,
        description: '로그인 성공',
        type: TokenResponseDto,
      }),
      ApiResponse({
        status: 401,
        description: '인증 실패 (이메일 또는 비밀번호 불일치)',
        schema: {
          example: {
            message: '유효하지 않은 이메일 또는 비밀번호입니다.',
            error: 'Unauthorized',
            statusCode: 401,
          },
        },
      }),
    ),

  /**
   * @summary Access Token 갱신 Swagger 데코레이터
   */
  refresh: () =>
    applyDecorators(
      ApiOperation({
        summary: '[네이티브] Access Token 갱신',
        description:
          '만료된 Access Token을 Refresh Token을 이용해 재발급받습니다.',
      }),
      ApiHeaders([
        {
          name: 'refresh-token',
          required: true,
          description: '로그인 시 발급받은 Refresh Token 값',
        },
      ]),
      ApiResponse({
        status: 200,
        description: '토큰 갱신 성공',
        type: TokenResponseDto,
      }),
      ApiResponse({
        status: 401,
        description: '인증 실패 (유효하지 않은 Refresh Token)',
        schema: {
          example: {
            message: '갱신 토큰이 만료되었거나 이미 사용되었습니다.',
            error: 'Unauthorized',
            statusCode: 401,
          },
        },
      }),
    ),

  /**
   * @summary 네이티브 계정 로그아웃 Swagger 데코레이터
   */
  logout: () =>
    applyDecorators(
      ApiOperation({
        summary: '[네이티브] 로그아웃',
        description: `서버에 저장된 Refresh Token을 삭제하여 현재 기기에서의 세션을 무효화합니다.
          header로 accessToken 을 담아서 요청하면 됨`,
      }),
      ApiBearerAuth('accessToken'), // Bearer Access Token 필요
      ApiResponse({
        status: 200,
        description: '로그아웃 성공',
      }),
      ApiResponse({
        status: 401,
        description: '인증 실패 (유효하지 않은 Access Token)',
      }),
    ),
  checkNickname: () =>
    applyDecorators(
      ApiOperation({
        summary: '[네이티브] 닉네임 중복 확인',
        description:
          '회원가입 시 사용할 닉네임이 중복되었는지 확인합니다. (Public API)',
      }),
      ApiResponse({
        status: 200,
        description: '확인 성공 (true: 사용 가능, false: 중복)',
        type: ResCheckNicknameDto, // 👈 [1] 에서 만든 응답 DTO
      }),
      ApiResponse({
        status: 400,
        description: '유효성 검사 실패 (닉네임 형식 오류)',
        schema: {
          example: {
            message: [
              '닉네임은 2~8자의 한글, 영어, 숫자만 사용 가능하며, 공백, 특수문자, 이모티콘은 허용되지 않습니다.',
            ],
            error: 'Bad Request',
            statusCode: 400,
          },
        },
      }),
    ),
};
