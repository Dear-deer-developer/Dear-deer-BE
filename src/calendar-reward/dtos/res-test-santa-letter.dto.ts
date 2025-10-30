import { ApiProperty } from '@nestjs/swagger';

export class ResTestSantaLetterDto {
  @ApiProperty({ example: true, description: '성공 여부' })
  success: boolean;

  @ApiProperty({ example: 125, description: '새로 생성된 편지 ID' })
  letterId: number;

  @ApiProperty({ example: 1, description: '보낸 사람(산타) ID' })
  senderId: number;
}
