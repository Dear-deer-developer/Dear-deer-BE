import { ApiProperty } from '@nestjs/swagger';
import {
  LetterStatus,
  LetterStatusValue,
} from 'src/common/enums/letter-status.enum';
import { ResSentLetterReceiverDto } from './res-sent-letter-receiver.dto';
import { Type } from 'class-transformer';

/**
 * '보낸 편지함 조회' (보낸 편지 목록) 응답용 DTO
 */
export class ResSentLetterDto {
  @ApiProperty({ example: 45, description: '편지 ID' })
  id: number;

  @ApiProperty({
    example: LetterStatusValue.SENT,
    enum: LetterStatusValue,
    description: '편지 상태 (SENT or RECEIVED)',
  })
  status: LetterStatus;

  @ApiProperty({
    example: '2025-05-27T10:00:00.000Z',
    description: '전송 시각',
  })
  sentAt: Date | null;

  @ApiProperty({
    type: () => ResSentLetterReceiverDto,
    nullable: true, // 수신자가 없을 수 있음
    description: '받는 사람 정보 (없으면 null)',
  })
  @Type(() => ResSentLetterReceiverDto)
  receiver: ResSentLetterReceiverDto | null; // 받는 사람이 null일 수 있음
}
