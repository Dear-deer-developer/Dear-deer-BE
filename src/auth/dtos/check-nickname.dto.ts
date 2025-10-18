import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CheckNicknameDto {
  @ApiProperty({
    description: '중복 확인할 닉네임 (2~10자)',
    example: '테스트닉네임',
  })
  @IsString()
  @MinLength(2, { message: '닉네임은 최소 2자 이상이어야 합니다.' })
  @MaxLength(10, { message: '닉네임은 최대 10자를 넘을 수 없습니다.' })
  @IsNotEmpty({ message: '닉네임은 필수 입력 항목입니다.' })
  nickname: string;
}
