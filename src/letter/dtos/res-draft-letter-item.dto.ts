import { ApiProperty } from '@nestjs/swagger';
import {
  LetterStatus,
  LetterStatusValue,
} from 'src/common/enums/letter-status.enum';

/**
 * '임시 보관함 조회' (임시저장 편지 목록) 응답용 DTO
 */
export class ResDraftLetterItemDto {
  @ApiProperty({ example: 43, description: '편지 ID' })
  id: number;

  @ApiProperty({ example: 2, nullable: true, description: '받는 사람 ID' })
  receiverId: number | null;

  @ApiProperty({
    example: '여기까지 썼어요...',
    description: '임시 저장된 편지 내용 (미리보기용)',
  })
  content: string;

  @ApiProperty({
    example: 'letters/temp-image.png',
    nullable: true,
    description: '임시 저장된 이미지 URL (썸네일용)',
  })
  imageUrl: string | null;

  @ApiProperty({
    example: LetterStatusValue.WRITING,
    enum: LetterStatusValue,
    description: '편지 상태 (무조건 WRITING)',
  })
  status: LetterStatus;

  @ApiProperty({
    example: '2025-05-28T14:30:00.000Z',
    description: '마지막으로 저장된 시각 (updatedAt)',
  })
  updatedAt: Date;
}
