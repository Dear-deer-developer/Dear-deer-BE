import { ApiProperty } from '@nestjs/swagger';

export class AuthorDto {
  @ApiProperty({ example: 1, description: '작성자 ID' })
  id: number;

  @ApiProperty({ example: '관리자닉네임', description: '작성자 닉네임' })
  nickname: string;
}
