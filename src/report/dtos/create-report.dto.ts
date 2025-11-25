import { IsNotEmpty, IsEnum, IsNumber } from 'class-validator';
import {
  ReportReason,
  reportReasonValue,
} from '../../common/enums/report-reason.enum';

export class CreateReportDto {
  @IsNumber()
  @IsNotEmpty()
  targetUserId: number;

  @IsNumber()
  @IsNotEmpty()
  letterId: number;

  @IsEnum(reportReasonValue, { message: '유효하지 않은 신고 유형입니다.' })
  @IsNotEmpty()
  reason: ReportReason; // 클라이언트는 위 Enum String 중 하나를 보냄
}
