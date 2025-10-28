import { ApiProperty } from '@nestjs/swagger';

export class FoundUserDto {
  @ApiProperty({ example: 42, description: '사용자 고유 ID' })
  id: number;

  @ApiProperty({ example: '루돌이', description: '사용자 닉네임' })
  nickname: string;
}
