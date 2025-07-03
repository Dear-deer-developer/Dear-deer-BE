import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNicknameDto {
  @ApiProperty({
    example: '디어디어',
    description: '등록할 닉네임 (몇자인지 미정, 한글/영어/숫자사용)',
  })
  @IsString()
  @Length(2, 12) //미정
  nickname: string;
}
