import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEthereumAddress,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class AuthRegisterDto {
  @ApiProperty({ example: 'deardeer@gmail.com', description: '이메일' })
  @IsEmail({}, { message: '유효한 이메일 형식이 아닙니다.' })
  @IsNotEmpty({ message: '이메일은 필수 입력 항목입니다.' })
  email: string;

  @ApiProperty({
    example: 'qlalfqjsgh1@',
    description:
      '비밀번호는 최소 8자, 최대 20자, 영문, 숫자, 특수문자를 모두 포함해야 합니다.',
  })
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '비밀번호는 필수 입력 항목입니다.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/, {
    message:
      '비밀번호는 최소 8자, 최대 20자, 영문, 숫자, 특수문자를 모두 포함해야 합니다.',
  })
  password: string;

  @ApiProperty({
    example: '루돌이',
    description:
      '닉네임은 2~8자의 한글, 영어, 숫자만 사용 가능하며, 공백, 특수문자, 이모티콘은 허용되지 않습니다.',
  })
  @IsString({ message: '닉네임은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '닉네임은 필수 입력 항목입니다.' })
  @Matches(/^[가-힣a-zA-Z0-9]{2,8}$/, {
    message:
      '닉네임은 2~8자의 한글, 영어, 숫자만 사용 가능하며, 공백, 특수문자, 이모티콘은 허용되지 않습니다.',
  })
  nickname: string;

  @ApiProperty({
    example: true,
    description: '필수 약관 동의 여부 (반드시 true여야 함)',
    type: Boolean,
  })
  @IsBoolean({ message: '약관 동의 여부는 boolean 값이어야 합니다.' })
  @IsEthereumAddress({ message: '필수 약관에 동의해야 회원가입이 가능합니다.' })
  isAgreed: boolean;
}
