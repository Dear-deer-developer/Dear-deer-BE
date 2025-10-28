import { ApiProperty } from '@nestjs/swagger';
import {
  LetterStatus,
  LetterStatusValue,
} from 'src/common/enums/letter-status.enum';
import { Type } from 'class-transformer';
import { ResReceivedLetterSenderDto } from './res-received-letter-sender.dto'; // (1) 이전 DTO 재사용

/**
 * '편지 단일 조회' 응답용 DTO
 */
export class ResLetterDto {
  @ApiProperty({ example: 44, description: '편지 ID' })
  id: number;

  @ApiProperty({ example: 1, description: '선택된 편지지 ID' })
  paperId: number;

  @ApiProperty({
    example: '안녕하세요, 편지 내용입니다...',
    description: '편지 본문',
  })
  content: string;

  @ApiProperty({
    example: 'https://s3.bucket/image.png?AWSAccessKeyId=...',
    nullable: true,
    description: 'S3 Pre-signed URL (이미지가 없으면 null)',
  })
  presignedUrl: string | null;

  @ApiProperty({
    example: LetterStatusValue.RECEIVED,
    enum: LetterStatusValue,
    description: '편지 상태 (SENT 또는 RECEIVED)',
  })
  status: LetterStatus;

  @ApiProperty({
    example: '2025-05-27T10:00:00.000Z',
    description: '전송(도착) 시각',
  })
  sentAt: Date | null;

  @ApiProperty({
    type: () => ResReceivedLetterSenderDto,
    description: '보낸 사람 정보',
  })
  @Type(() => ResReceivedLetterSenderDto)
  sender: ResReceivedLetterSenderDto;

  @ApiProperty({
    type: () => ResReceivedLetterSenderDto,
    nullable: true,
    description: '받는 사람 정보 (없으면 null)',
  })
  @Type(() => ResReceivedLetterSenderDto)
  receiver: ResReceivedLetterSenderDto | null;
}
