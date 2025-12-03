import { ApiProperty } from '@nestjs/swagger';

export class ResMessageDto {
  @ApiProperty({
    description: '처리 결과 메시지',
    example: '요청이 성공적으로 처리되었습니다.',
  })
  message: string;
}
