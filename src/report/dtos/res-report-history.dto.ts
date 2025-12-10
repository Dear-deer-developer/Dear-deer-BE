import { ApiProperty } from '@nestjs/swagger';
import {
  ReportReason,
  reportReasonValue,
} from 'src/common/enums/report-reason.enum';

class HistoryReporterDto {
  @ApiProperty() readonly id: number;
  @ApiProperty() readonly nickname: string;
}

class HistoryTargetDto {
  @ApiProperty() readonly id: number;
  @ApiProperty() readonly nickname: string;
}

export class ResReportHistoryDto {
  @ApiProperty({ description: '신고 ID', example: 1 })
  readonly id: number;

  @ApiProperty({
    description: '신고 사유',
    enum: reportReasonValue,
    example: reportReasonValue.COMMERCIAL_AD,
  })
  readonly reason: ReportReason;

  @ApiProperty({ description: '신고 접수일', example: '2025-11-25T12:00:00Z' })
  readonly createdAt: Date;

  @ApiProperty({ description: '처리 여부', example: true })
  readonly isResolved: boolean;

  @ApiProperty({ description: '신고한 사람 정보' })
  readonly reporter: HistoryReporterDto;

  @ApiProperty({ description: '신고 당한 사람 정보' })
  readonly reportedUser: HistoryTargetDto;

  @ApiProperty({
    description: '처리 결과 (BANNED: 밴 처리됨, DISMISSED: 반려됨/일반 처리)',
    example: 'BANNED',
  })
  readonly outcome: 'BANNED' | 'DISMISSED';

  @ApiProperty({
    description: '처리 일시 (업데이트 시간)',
    example: '2025-12-26T15:00:00Z',
  })
  readonly processedAt: Date;

  // 1. 생성자: 외부에서 값을 받아 내 속성에 할당
  constructor(props: Partial<ResReportHistoryDto>) {
    this.id = props.id;
    this.reason = props.reason;
    this.createdAt = props.createdAt;
    this.isResolved = props.isResolved;
    this.reporter = props.reporter;
    this.reportedUser = props.reportedUser;
    this.outcome = props.outcome;
    this.processedAt = props.processedAt;
  }

  // 2. 정적 팩토리 메서드: DB 데이터를 받아서 DTO 인스턴스로 변환
  static from(data: any): ResReportHistoryDto {
    const isBanned = !!data.reportedUser.banInfo; // 밴 여부 판단

    return new ResReportHistoryDto({
      id: data.id,
      reason: data.reason,
      createdAt: data.createdAt,
      isResolved: true,

      reporter: {
        id: data.reporter.id,
        nickname: data.reporter.nickname,
      },

      reportedUser: {
        id: data.reportedUser.id,
        nickname: data.reportedUser.nickname,
      },

      outcome: isBanned ? 'BANNED' : 'DISMISSED',
      processedAt: data.updatedAt,
    });
  }
}
