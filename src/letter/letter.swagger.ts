import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SendLetterDto } from './dtos/send-letter.dto';
import { SaveWritingDto } from './dtos/save-writing.dto';
import { ResSendLetterDto } from './dtos/res-send-letter.dto';
import { DeleteLettersDto } from './dtos/delete-letter.dto';
import { ResDraftLetterDto } from './dtos/res-draft-letter.dto';
import { ResReceivedLetterDto } from './dtos/res-received-letter.dto';
import { ResDraftLetterItemDto } from './dtos/res-draft-letter-item.dto';
import { ResSentLetterDto } from './dtos/res-sent-letter.dto';
import { ResLetterDto } from './dtos/res-letter.dto';
import { ResDeleteLettersDto } from './dtos/res-delete-letter.dto';

// 모든 API에 공통으로 적용될 401 Unauthorized 응답
const ApiUnauthorizedResponse = ApiResponse({
  status: 401,
  description: '인증 실패 (유효하지 않은 토큰 또는 토큰 없음)',
  content: {
    'application/json': {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  },
});

export const ApiLetters = {
  /** POST /letters */
  send: () =>
    applyDecorators(
      ApiOperation({
        summary: '편지 전송',
        description: '편지를 실제로 전송하며, 상태는 `sent`로 설정됩니다.',
      }),
      ApiBody({
        description: '편지 전송에 필요한 정보',
        type: SendLetterDto,
      }),
      ApiBearerAuth('accessToken'),
      ApiResponse({
        status: 201,
        description: '편지가 성공적으로 전송되었습니다.',
        type: ResSendLetterDto, // ResLetterDto를 type으로 사용하면 예시를 별도로 명시할 필요가 줄어듭니다.
      }),
      ApiResponse({
        status: 400,
        description: '요청이 잘못되었거나, 유효하지 않은 값이 포함됨',
      }),
      ApiResponse({
        status: 409,
        description: '중복되거나 유효하지 않은 요청',
      }),
      ApiUnauthorizedResponse,
    ),

  /** POST /letters/draft */
  saveDraft: () =>
    applyDecorators(
      ApiOperation({ summary: '편지 임시 저장' }),
      ApiBody({ type: SaveWritingDto }),
      ApiBearerAuth('accessToken'),
      ApiResponse({
        status: 201,
        description: '임시 저장 완료',
        type: ResDraftLetterDto,
      }),
      ApiResponse({
        status: 400,
        description: '잘못된 입력 값',
      }),
      ApiUnauthorizedResponse,
    ),

  /** GET /letters/received */
  findReceived: () =>
    applyDecorators(
      ApiOperation({
        summary: '내 사서함 조회',
        description: '수신자가 나인 편지들만 조회합니다.',
      }),
      ApiBearerAuth('accessToken'),
      ApiResponse({
        status: 200,
        type: ResReceivedLetterDto,
        isArray: true,
        description: '내가 받은 편지함 목록',
      }),
      ApiUnauthorizedResponse,
    ),

  /** GET /letters/sent */
  findSent: () =>
    applyDecorators(
      ApiOperation({
        summary: '보낸 편지함 조회',
        description: '내가 발송한 편지들만 조회됩니다.',
      }),
      ApiBearerAuth('accessToken'),
      ApiResponse({
        status: 200,
        type: ResSentLetterDto,
        isArray: true,
        description: '내가 보낸 편지함 목록',
      }),
      ApiUnauthorizedResponse,
    ),

  /** GET /letters/draft */
  findDraft: () =>
    applyDecorators(
      ApiOperation({
        summary: '임시 보관함 조회',
        description: 'status가 `writing` 상태인 편지들만 조회됩니다.',
      }),
      ApiBearerAuth('accessToken'),
      ApiResponse({
        status: 200,
        type: ResDraftLetterItemDto,
        isArray: true,
        description: '임시 저장된 편지함 목록',
      }),
      ApiUnauthorizedResponse,
    ),

  /** GET /letters/:letterId */
  findOne: () =>
    applyDecorators(
      ApiOperation({
        summary: '단일 편지 조회',
        description:
          '수신자가 본인이고, status가 `sent` 라면 status는 `received` 상태로 변경됩니다.',
      }),
      ApiBearerAuth('accessToken'),
      // 경로 매개변수 추가
      ApiParam({
        name: 'letterId',
        description: '조회할 편지의 ID',
        type: Number,
        example: 42,
      }),
      ApiResponse({
        status: 200,
        type: ResLetterDto,
        description: '편지 조회 성공',
      }),
      ApiResponse({
        status: 404,
        description: '해당 ID의 편지가 존재하지 않거나 접근 권한이 없음',
      }),
      ApiUnauthorizedResponse,
    ),

  /** DELETE /letters */
  delete: () =>
    applyDecorators(
      ApiOperation({
        summary: '선택한 편지들 삭제',
        description:
          '요청 본문에 포함된 ID 목록에 해당하는 편지들을 삭제합니다.',
      }),
      ApiBearerAuth('accessToken'),
      ApiResponse({
        status: 200, // ⬅️ 200 OK
        description: '삭제 처리 결과 (성공, 실패 목록)',
        type: ResDeleteLettersDto, // ⬅️ 응답 DTO 명시
      }),
      ApiResponse({
        status: 400,
        description: '잘못된 요청 (letterIds 필드 오류 등)',
      }),
      ApiResponse({
        status: 404,
        description:
          '삭제하려는 편지 ID 중 존재하지 않거나 권한이 없는 ID 포함',
      }),
      ApiUnauthorizedResponse,
    ),
};
