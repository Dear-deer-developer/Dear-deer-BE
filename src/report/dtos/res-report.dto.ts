import { ApiProperty } from '@nestjs/swagger';
import {
  ReportReason,
  reportReasonValue,
} from 'src/common/enums/report-reason.enum';

// 1. 신고자 정보 (닉네임 포함)
export class ResReportReporterDto {
  @ApiProperty({ description: '유저 ID', example: 2 })
  id: number;

  @ApiProperty({ description: '닉네임', example: 'gw구글' })
  nickname: string;
}

// 2. 신고 당한 유저 정보 (목록에서는 ID만)
export class ResReportTargetSimpleDto {
  @ApiProperty({ description: '유저 ID', example: 6 })
  id: number;

  @ApiProperty({ description: '닉네임', example: 'gw네이버' })
  nickname: string;
}

// 3. [목록 조회용] 메인 DTO
export class ResReportDto {
  @ApiProperty({ description: '신고 ID', example: 1 })
  id: number;

  @ApiProperty({
    description: '신고 접수일',
    example: '2025-11-26T06:18:45.037Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '신고 사유',
    enum: reportReasonValue,
    enumName: 'ReportReason',
    example: reportReasonValue.COMMERCIAL_AD,
  })
  reason: ReportReason;

  @ApiProperty({ description: '처리 여부', example: false })
  isResolved: boolean;

  @ApiProperty({ description: '신고한 사람 정보', type: ResReportReporterDto })
  reporter: ResReportReporterDto;

  @ApiProperty({
    description: '신고 당한 사람 정보',
    type: ResReportTargetSimpleDto,
  })
  reportedUser: ResReportTargetSimpleDto;
}
