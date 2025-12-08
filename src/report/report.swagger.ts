import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CreateReportDto } from './dtos/create-report.dto';
import { BanUserDto } from './dtos/ban-user.dto';
// [참고] 목록 조회 시 반환될 DTO가 필요합니다. 없다면 만들어두시는 게 좋습니다.
import { ResReportDto } from './dtos/res-report.dto';
import { ResMessageDto } from 'src/common/dtos/res-message.dto';
import { ResReportDetailDto } from './dtos/res-report-detail.dto';
import { ResReportHistoryDto } from './dtos/res-report-history.dto';
import { BlockUserDto } from './dtos/block-user.dto';

// 1. 공통 401 Unauthorized
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

// 2. 관리자 전용 403 Forbidden
const ApiForbiddenResponse = ApiResponse({
  status: 403,
  description: '접근 권한 없음 (관리자 계정이 아님)',
  content: {
    'application/json': {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  },
});

export const ApiReports = {
  /** POST /reports (사용자 신고) */
  create: () =>
    applyDecorators(
      ApiOperation({
        summary: '사용자 신고',
        description:
          '특정 사용자를 신고합니다. 신고 즉시 신고자는 대상자를 **일방 차단**하게 되며, 신고 내용은 관리자에게 전송됩니다. (상대방은 차단 사실을 알 수 없습니다)',
      }),
      ApiBody({
        description: '신고 대상, 사유 및 상세 내용',
        type: CreateReportDto,
      }),
      ApiBearerAuth('accessToken'),
      ApiResponse({
        status: 201,
        description: '신고 접수 및 차단 완료',
        type: ResMessageDto,
      }),
      ApiResponse({
        status: 400,
        description: '잘못된 요청 (본인 신고 등)',
      }),
      ApiResponse({
        status: 409,
        description: '이미 신고/차단된 사용자',
      }),
      ApiUnauthorizedResponse,
    ),

  /** POST /reports/block (사용자 차단 - 신고 없음) */
  block: () =>
    applyDecorators(
      ApiOperation({
        summary: '사용자 차단 (신고 x)',
        description:
          '신고 과정 없이 특정 사용자를 즉시 차단합니다. **일방 차단**이며 상대방은 차단 사실을 알 수 없습니다.',
      }),
      ApiBody({
        description: '차단할 대상 유저 ID',
        type: BlockUserDto,
      }),
      ApiBearerAuth('accessToken'),
      ApiResponse({
        status: 201,
        description: '차단 완료',
        type: ResMessageDto,
      }),
      ApiResponse({
        status: 400,
        description: '잘못된 요청 (본인 차단 등)',
      }),
      ApiResponse({
        status: 409,
        description: '이미 차단된 사용자',
      }),
      ApiUnauthorizedResponse,
    ),

  /** GET /reports/admin/list (관리자 - 신고 목록 조회) */
  findAllPending: () =>
    applyDecorators(
      ApiOperation({
        summary: '미처리 신고 내역 조회 (관리자)',
        description: '편지 내용 없이 가벼운 요약 목록을 반환합니다.',
      }),
      ApiBearerAuth('jwtAdmin'),
      ApiResponse({
        status: 200,
        description: '신고 목록 조회 성공',
        type: ResReportDto,
        isArray: true,
      }),
      ApiUnauthorizedResponse,
      ApiForbiddenResponse,
    ),

  /** GET /reports/history (관리자 - 신고 처리 내역) */
  findAllHistory: () =>
    applyDecorators(
      ApiOperation({
        summary: '신고 처리 내역 조회 (관리자)',
        description: '처리 완료된(밴 또는 반려) 신고 내역을 조회합니다.',
      }),
      ApiBearerAuth('jwtAdmin'),
      ApiResponse({
        status: 200,
        description: '처리 내역 조회 성공',
        type: ResReportHistoryDto,
        isArray: true,
      }),
      ApiUnauthorizedResponse,
      ApiForbiddenResponse,
    ),

  /** GET /reports/admin/:reportId (관리자 - 상세 조회) */
  findOne: () =>
    applyDecorators(
      ApiOperation({
        summary: '신고 상세 조회 (관리자)',
        description: '신고의 상세 내용과 관련된 편지 원본을 조회합니다.',
      }),
      ApiBearerAuth('jwtAdmin'),
      ApiParam({
        name: 'reportId',
        description: '조회할 신고 ID',
        type: Number,
        example: 1,
      }),
      ApiResponse({
        status: 200,
        description: '신고 상세 정보 조회 성공',
        type: ResReportDetailDto, // 상세용 DTO 적용
      }),
      ApiResponse({
        status: 404,
        description: '존재하지 않는 신고 ID',
      }),
      ApiUnauthorizedResponse,
      ApiForbiddenResponse,
    ),

  /** POST /reports/admin/ban (관리자 - 유저 밴) */
  banUser: () =>
    applyDecorators(
      ApiOperation({
        summary: '유저 밴 처리 (관리자)',
        description:
          '신고된 유저를 영구 정지(Ban) 시키고, 관련된 모든 신고 내역을 처리됨(Resolved) 상태로 변경합니다.',
      }),
      ApiBody({
        description: '밴 대상 유저 ID 및 관리자 코멘트',
        type: BanUserDto,
      }),
      ApiBearerAuth('jwtAdmin'),
      ApiResponse({
        status: 201,
        description: '밴 처리 성공',
        type: ResMessageDto,
      }),
      ApiResponse({
        status: 400,
        description: '이미 밴 처리된 유저이거나 잘못된 요청',
      }),
      ApiUnauthorizedResponse,
      ApiForbiddenResponse,
    ),

  /** POST /reports/admin/:reportId/dismiss (관리자 - 반려) */
  dismiss: () =>
    applyDecorators(
      ApiOperation({
        summary: '신고 반려 (관리자)',
        description:
          '신고 내용을 검토했으나 밴 사유가 아니라고 판단될 때 사용합니다. 해당 신고를 "처리됨" 상태로 변경하여 목록에서 제거합니다. (기존 차단 관계는 유지됩니다)',
      }),
      ApiParam({
        name: 'reportId',
        description: '처리할 신고 내역의 ID',
        type: Number,
      }),
      ApiBearerAuth('jwtAdmin'),
      ApiResponse({
        status: 201,
        description: '반려 처리 성공',
        type: ResMessageDto,
      }),
      ApiResponse({
        status: 404,
        description: '존재하지 않는 신고 ID',
      }),
    ),
};
