import { ApiProperty } from '@nestjs/swagger';
import {
  LetterStatus,
  LetterStatusValue,
} from 'src/common/enums/letter-status.enum';

export class ResDraftLetterDto {
  @ApiProperty({ example: 43, description: '편지 ID (없었으면 새로 생성됨)' })
  id: number;

  @ApiProperty({ example: 17, description: '작성자 ID' })
  senderId: number;

  @ApiProperty({ example: 2, nullable: true, description: '받는 사람 ID' })
  receiverId: number | null;

  @ApiProperty({
    example: '여기까지 썼어요...',
    description: '방금 저장된 편지 내용',
  })
  content: string;

  @ApiProperty({
    example: 'letters/temp-image.png',
    nullable: true,
    description: '방금 저장된 이미지 URL',
  })
  imageUrl: string | null;

  @ApiProperty({
    example: LetterStatusValue.WRITING,
    enum: LetterStatusValue,
    description: '편지 상태 (무조건 WRITING)',
  })
  status: LetterStatus;

  @ApiProperty({
    example: null,
    nullable: true,
    description: '전송 시각 (임시저장이므로 null)',
  })
  sentAt: Date | null;
}
