import { ApiProperty } from '@nestjs/swagger';
import {
  LetterStatus,
  LetterStatusValue,
} from 'src/common/enums/letter-status.enum';

export class ResSendLetterDto {
  @ApiProperty({ example: 42 })
  id: number;

  @ApiProperty({ example: 17 })
  senderId: number;

  @ApiProperty({ example: 2, nullable: true })
  receiverId: number | null;

  @ApiProperty({ example: LetterStatusValue.SENT, enum: LetterStatusValue })
  status: LetterStatus;

  @ApiProperty({ example: '2025-05-26T11:15:00.000Z' })
  sentAt: Date | null;
}
