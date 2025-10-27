import { ApiProperty } from '@nestjs/swagger';

/**
 * '보낸 편지함 조회'시 반환되는 객체 내부의 'receiver' 정보
 * (수신자가 지정되지 않은 편지일 수 있으므로 null일 수 있음)
 */
export class ResSentLetterReceiverDto {
  @ApiProperty({ example: 2, description: '받는 사람의 고유 ID' })
  id: number;

  @ApiProperty({ example: '행복한 순록', description: '받는 사람의 닉네임' })
  nickname: string;
}
