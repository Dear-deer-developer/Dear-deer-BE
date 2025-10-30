import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import {
  LetterStatus,
  LetterStatusValue,
} from 'src/common/enums/letter-status.enum';

class ResDraftLetterReceiverDto {
  @ApiProperty({
    example: '루돌이',
    nullable: true,
    description: '수신자 닉네임 (지정 안됐으면 null)',
  })
  nickname: string | null;
}

/**
 * '임시 보관함 조회' (임시저장 편지 목록) 응답용 DTO
 */
export class ResDraftLetterItemDto {
  @ApiProperty({ example: 43, description: '편지 ID' })
  id: number;

  @ApiProperty({
    type: () => ResDraftLetterReceiverDto,
    nullable: true,
    description: '수신자 정보 (수신자가 지정되지 않았으면 null)',
  })
  @Type(() => ResDraftLetterReceiverDto) // `class-transformer`가 객체로 변환하도록
  @ValidateNested() // 중첩 DTO 유효성 검사
  receiver: ResDraftLetterReceiverDto | null;

  @ApiProperty({
    example: '여기까지 썼어요...',
    description: '임시 저장된 편지 내용 (미리보기용)',
  })
  content: string;

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
