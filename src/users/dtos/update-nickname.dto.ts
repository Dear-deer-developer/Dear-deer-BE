import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNicknameDto {
  @ApiProperty({
    example: '디어디어',
    description:
      '닉네임 (2~8자, 한글/영어/숫자만 허용, 공백/이모티콘/특수문자 불가)',
  })
  @IsString()
  @Matches(/^[가-힣a-zA-Z0-9]{2,8}$/, {
    message:
      '닉네임은 2~8자의 한글, 영어, 숫자만 허용되며, 공백/이모티콘/특수문자는 허용되지 않습니다.',
  })
  nickname: string;
}
