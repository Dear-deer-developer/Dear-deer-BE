import { ApiProperty } from '@nestjs/swagger';
import { ResReportDto, ResReportReporterDto } from './res-report.dto';

// 1. 신고 당한 유저 상세 정보 (닉네임 포함)
class ResReportTargetDetailDto extends ResReportReporterDto {}

// 2. 편지 상세 정보
class ResReportLetterDetailDto {
  @ApiProperty({ description: '편지 ID', example: 100 })
  id: number;

  @ApiProperty({
    description: '편지 내용',
    example: '이 유저가 광고를 보냈습니다...',
  })
  content: string;

  @ApiProperty({
    description: '이미지 URL',
    example: 'https://s3...',
    nullable: true,
  })
  imageUrl: string | null;

  @ApiProperty({ description: '보낸 날짜', example: '2025-12-25T00:00:00Z' })
  sentAt: Date;
}

// 3. [상세 조회용] 메인 DTO
// 목록용 DTO(ResReportDto)를 상속받되, 덮어쓸 필드만 재정의합니다.
export class ResReportDetailDto extends ResReportDto {
  // [덮어쓰기] 상세 조회에서는 신고 당한 사람 닉네임도 보여줌
  @ApiProperty({
    description: '신고 당한 사람 상세 정보',
    type: ResReportTargetDetailDto,
  })
  reportedUser: ResReportTargetDetailDto;

  // [추가] 편지 상세 정보 (Nullable)
  @ApiProperty({
    description: '신고된 편지 상세 정보 (삭제되었거나 유저 신고인 경우 null)',
    type: ResReportLetterDetailDto,
    nullable: true,
  })
  letter: ResReportLetterDetailDto | null;
}
