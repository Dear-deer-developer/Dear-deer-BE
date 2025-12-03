import { IsNotEmpty, IsEnum, IsNumber, IsOptional } from 'class-validator';
import {
  ReportReason,
  reportReasonValue,
} from '../../common/enums/report-reason.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({
    description: '신고할 대상 유저의 ID',
    example: 6,
  })
  @IsNumber()
  @IsNotEmpty()
  targetUserId: number;

  @ApiProperty({
    description: '신고할 편지의 ID (편지 신고가 아닐 경우 생략 가능)',
    example: 105,
    required: false, // Swagger에서 Optional 표시
  })
  @IsNumber()
  @IsOptional()
  letterId?: number;

  @ApiProperty({
    description: '신고 사유',
    enum: reportReasonValue,
    example: reportReasonValue.COMMERCIAL_AD, // Enum 값 예시
  })
  @IsEnum(reportReasonValue, { message: '유효하지 않은 신고 유형입니다.' })
  @IsNotEmpty()
  reason: ReportReason; // 클라이언트는 위 Enum String 중 하나를 보냄
}
