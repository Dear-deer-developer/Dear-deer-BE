import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class SetNewPasswordDto {
  @ApiProperty({
    example: 'qlalfqjsgh1@',
    description:
      '비밀번호는 최소 8자, 최대 20자, 영문, 숫자, 특수문자를 모두 포함해야 합니다.',
  })
  @IsString()
  @IsNotEmpty({ message: '새 비밀번호는 필수 입력 항목입니다.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/, {
    message:
      '비밀번호는 최소 8자, 최대 20자, 영문, 숫자, 특수문자를 모두 포함해야 합니다.',
  })
  newPassword: string;
}
