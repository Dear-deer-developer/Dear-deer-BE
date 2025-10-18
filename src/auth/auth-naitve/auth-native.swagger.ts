import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeaders,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthRegisterDto } from '../dtos/auth-register.dto';
import { TokenResponseDto } from '../dtos/token-res.dto';
import { AuthLoginDto } from '../dtos/auth-login.dto';
import { AuthEmailDto } from '../dtos/auth-email.dto';
import { VerifyCodeDto } from '../dtos/verify-code.dto';
import { SetNewPasswordDto } from '../dtos/set-new-password.dto';
import { VerifyCurrentPasswordDto } from '../dtos/verify-current-password.dto';
import { CheckNicknameDto } from '../dtos/check-nickname.dto';
import { CheckEmailDto } from '../dtos/check-email.dto';

// 💡 Generic Error Schema for reusability
const UnauthorizedError = {
  description: '인증 실패 (토큰 불일치, 만료 등)',
  schema: {
    example: {
      message: 'Unauthorized',
      statusCode: 401,
    },
  },
};

const BadRequestError = {
  description: '잘못된 요청 (입력 값 오류 등)',
  schema: {
    example: {
      message: 'Bad Request',
      statusCode: 400,
    },
  },
};

export const ApiAuthNative = {
  /**
   * @summary 네이티브 계정 회원가입
   */
  register: () =>
    applyDecorators(
      ApiOperation({
        summary: '[네이티브] 회원가입',
        description: `이메일 인증 완료 후, 이메일, 비밀번호, 닉네임 등으로 가입하고 토큰을 발급받습니다.
        **사전에 반드시 '회원가입용 이메일 인증' API를 호출해야 합니다.**`,
      }),
      ApiBody({ type: AuthRegisterDto }),
      ApiResponse({
        status: 201,
        description: '회원가입 성공',
        type: TokenResponseDto,
      }),
      ApiResponse({
        status: 401,
        description: '이메일 인증 미완료',
        schema: {
          example: {
            message: '이메일 인증이 완료되지 않았습니다.',
            error: 'Unauthorized',
            statusCode: 401,
          },
        },
      }),
      ApiResponse({
        status: 409,
        description: '이메일 또는 닉네임 중복',
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
   * @summary 네이티브 계정 로그인
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
        description: '인증 실패 (자격 증명 불일치)',
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
   * @summary [네이티브] 이메일 중복 확인
   */
  checkEmail: () =>
    applyDecorators(
      ApiOperation({
        summary: '[네이티브] 이메일 중복 확인',
        description:
          '입력한 이메일이 이미 데이터베이스에 등록되어 있는지 확인합니다.',
      }),
      ApiBody({ type: CheckEmailDto }),
      ApiResponse({
        status: 200,
        description: '사용 가능한 이메일',
        schema: { example: { message: '사용 가능한 이메일입니다.' } },
      }),
      ApiResponse({
        status: 409,
        description: '이미 사용 중인 이메일',
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
   * @summary [네이티브] 닉네임 중복 확인
   */
  checkNickname: () =>
    applyDecorators(
      ApiOperation({
        summary: '[공통] 닉네임 중복 확인',
        description:
          '입력한 닉네임이 이미 데이터베이스에 등록되어 있는지 확인합니다.',
      }),
      ApiBody({ type: CheckNicknameDto }),
      ApiResponse({
        status: 200,
        description: '사용 가능한 닉네임',
        schema: { example: { message: '사용 가능한 닉네임입니다.' } },
      }),
      ApiResponse({
        status: 409,
        description: '이미 사용 중인 닉네임',
        schema: {
          example: {
            message: '이미 사용 중인 닉네임입니다.',
            error: 'Conflict',
            statusCode: 409,
          },
        },
      }),
    ),

  /**
   * @summary Access Token 갱신
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
          description: '로그인 시 발급받은 Refresh Token',
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
   * @summary 네이티브 계정 로그아웃
   */
  logout: () =>
    applyDecorators(
      ApiOperation({
        summary: '[네이티브] 로그아웃',
        description:
          '서버에 저장된 Refresh Token을 삭제하여 현재 세션을 무효화합니다.',
      }),
      ApiBearerAuth('accessToken'),
      ApiResponse({ status: 200, description: '로그아웃 성공' }),
      ApiResponse({ status: 401, ...UnauthorizedError }),
    ),

  /**
   * @summary [회원가입용] 이메일 인증코드 발송
   */
  sendRegisterCode: () =>
    applyDecorators(
      ApiOperation({
        summary: '[회원가입용] 이메일 인증코드 발송',
        description:
          '회원가입에 사용할 6자리 인증코드를 이메일로 발송합니다. **이미 가입된 이메일인 경우 에러를 반환합니다.**',
      }),
      ApiBody({ type: AuthEmailDto }),
      ApiResponse({
        status: 200,
        description: '이메일 발송 요청 성공',
        schema: { example: { message: '인증 코드를 이메일로 발송했습니다.' } },
      }),
      ApiResponse({
        status: 409,
        description: '이미 가입된 이메일',
        schema: {
          example: {
            message: '이미 가입된 이메일입니다.',
            error: 'Conflict',
            statusCode: 409,
          },
        },
      }),
    ),

  /**
   * @summary [비밀번호 찾기용] 이메일 인증코드 발송
   */
  sendResetPasswordCode: () =>
    applyDecorators(
      ApiOperation({
        summary: '[비밀번호 찾기용] 이메일 인증코드 발송',
        description: `회원가입 또는 비밀번호 찾기에 사용할 6자리 인증코드를 이메일로 발송합니다.
        **계정 존재 여부를 숨기기 위해, 성공/실패와 무관하게 항상 동일한 성공 메시지를 반환합니다.**`,
      }),
      ApiBody({ type: AuthEmailDto }),
      ApiResponse({
        status: 200,
        description: '이메일 발송 요청 성공',
        schema: {
          example: { message: '비밀번호 재설정 코드를 이메일로 발송했습니다.' },
        },
      }),
    ),

  /**
   * @summary [회원가입용] 이메일 인증코드 검증
   */
  verifyRegisterCode: () =>
    applyDecorators(
      ApiOperation({
        summary: '[회원가입용] 이메일 인증코드 검증',
        description: `회원가입 과정에서 이메일 주소의 소유권을 확인합니다.
        성공 시, 서버에 '인증 완료' 상태가 기록됩니다.`,
      }),
      ApiBody({ type: VerifyCodeDto }),
      ApiResponse({
        status: 200,
        description: '인증 성공',
        schema: {
          example: {
            message: '인증 코드가 일치합니다. 회원가입을 진행해 주세요.',
          },
        },
      }),
      ApiResponse({
        status: 400,
        description: '잘못된 요청 (코드 불일치, 만료, 횟수 초과 등)',
        schema: {
          example: {
            message: {
              message: '인증 코드가 일치하지 않습니다.',
              attemptCount: 1,
            },
            statusCode: 400,
          },
        },
      }),
    ),

  /**
   * @summary [비밀번호 찾기용] 이메일 인증코드 검증
   */
  verifyPasswordCode: () =>
    applyDecorators(
      ApiOperation({
        summary: '[비밀번호 찾기용] 이메일 인증코드 검증',
        description:
          '비밀번호를 잊은 사용자가 본인임을 확인하고, 즉시 로그인할 수 있는 토큰을 발급받습니다.',
      }),
      ApiBody({ type: VerifyCodeDto }),
      ApiResponse({
        status: 200,
        description: '인증 성공 및 토큰 발급',
        type: TokenResponseDto,
      }),
      ApiResponse({ status: 400, ...BadRequestError }),
      ApiResponse({
        status: 404,
        description: '존재하지 않는 계정',
        schema: {
          example: {
            message: '유효하지 않은 이메일 주소입니다.',
            statusCode: 404,
          },
        },
      }),
    ),

  /**
   * @summary [네이티브] 새 비밀번호 설정
   */
  resetPassword: () =>
    applyDecorators(
      ApiOperation({
        summary: '[네이티브] 새 비밀번호 설정',
        description: `로그인된 상태에서 새 비밀번호로 변경합니다.
        **'비밀번호 찾기' 후 또는 '마이페이지'에서 현재 비밀번호 검증 후에 사용됩니다.**`,
      }),
      ApiBearerAuth('accessToken'),
      ApiBody({ type: SetNewPasswordDto }),
      ApiResponse({
        status: 200,
        description: '비밀번호 변경 성공',
        schema: {
          example: {
            message:
              '비밀번호가 성공적으로 변경되었습니다. 다시 로그인해 주세요.',
          },
        },
      }),
      ApiResponse({ status: 401, ...UnauthorizedError }),
    ),

  /**
   * @summary [네이티브] 현재 비밀번호 검증
   */
  verifyCurrentPassword: () =>
    applyDecorators(
      ApiOperation({
        summary: '[네이티브] 현재 비밀번호 검증',
        description:
          '마이페이지에서 비밀번호를 변경하기 전, 현재 비밀번호를 입력하여 본인임을 확인합니다.',
      }),
      ApiBearerAuth('accessToken'),
      ApiBody({ type: VerifyCurrentPasswordDto }),
      ApiResponse({
        status: 200,
        description: '비밀번호 확인 성공',
        schema: {
          example: {
            message: '비밀번호가 확인되었습니다. 새 비밀번호를 입력해 주세요.',
          },
        },
      }),
      ApiResponse({
        status: 401,
        description: '인증 실패 (현재 비밀번호 불일치)',
        schema: {
          example: {
            message: '현재 비밀번호가 일치하지 않습니다.',
            error: 'Unauthorized',
            statusCode: 401,
          },
        },
      }),
    ),
};
