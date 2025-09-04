import {
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

export function SwaggerAdminDashboard() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: '관리자 전용 대시보드' }),
    ApiResponse({
      status: 200,
      description: '성공',
      schema: { example: { message: '🎉 관리자 전용 대시보드입니다' } },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized(토큰 없음/유효하지 않음)',
    }),
    ApiResponse({ status: 403, description: 'Forbidden(관리자 아님)' }),
  );
}
