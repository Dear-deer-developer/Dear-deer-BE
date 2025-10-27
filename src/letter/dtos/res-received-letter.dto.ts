import { ApiProperty } from '@nestjs/swagger';
import {
  LetterStatus,
  LetterStatusValue,
} from 'src/common/enums/letter-status.enum';
import { ResReceivedLetterSenderDto } from './res-received-letter-sender.dto';
import { Type } from 'class-transformer';

/**
 * '내 사서함 조회' (받은 편지 목록) 응답용 DTO
 */
export class ResReceivedLetterDto {
  @ApiProperty({ example: 44, description: '편지 ID' })
  id: number;

  @ApiProperty({
    example: LetterStatusValue.SENT,
    enum: LetterStatusValue,
    description: '편지 상태 (SENT: 아직 안 읽음, RECEIVED: 읽음)',
  })
  status: LetterStatus;

  @ApiProperty({
    example: '2025-05-27T10:00:00.000Z',
    description: '전송(도착) 시각',
  })
  sentAt: Date | null;

  @ApiProperty({
    type: () => ResReceivedLetterSenderDto, // (1) Nested DTO 타입 명시
    description: '보낸 사람 정보',
  })
  @Type(() => ResReceivedLetterSenderDto) // (2) class-transformer용
  sender: ResReceivedLetterSenderDto;
}
