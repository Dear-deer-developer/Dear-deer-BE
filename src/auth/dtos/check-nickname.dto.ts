import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CheckNicknameDto {
  @ApiProperty({
    example: '루돌이',
    description: '중복 확인할 닉네임 (2~8자, 한글/영문/숫자)',
  })
  @IsString({ message: '닉네임은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '닉네임은 필수 입력 항목입니다.' })
  @Matches(/^[가-힣a-zA-Z0-9]{2,8}$/, {
    message:
      '닉네임은 2~8자의 한글, 영어, 숫자만 사용 가능하며, 공백, 특수문자, 이모티콘은 허용되지 않습니다.',
  })
  nickname: string;
}
