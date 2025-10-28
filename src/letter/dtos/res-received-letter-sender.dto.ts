import { ApiProperty } from '@nestjs/swagger';

/**
 * '내 사서함 조회'시 반환되는 객체 내부의 'sender' 정보
 */
export class ResReceivedLetterSenderDto {
  @ApiProperty({ example: 17, description: '보낸 사람의 고유 ID' })
  id: number;

  @ApiProperty({ example: '친절한사슴', description: '보낸 사람의 닉네임' })
  nickname: string;
}
