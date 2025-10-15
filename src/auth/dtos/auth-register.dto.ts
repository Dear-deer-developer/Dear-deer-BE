import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class AuthRegisterDto {
  @ApiProperty({ example: 'deardeer@gmail.com', description: '이메일' })
  @IsEmail({}, { message: '유효한 이메일 형식이 아닙니다.' })
  @IsNotEmpty({ message: '이메일은 필수 입력 항목입니다.' })
  email: string;

  @ApiProperty({ example: 'qlalfqjsgh1@', description: '비밀번호' })
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '비밀번호는 필수 입력 항목입니다.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/, {
    message:
      '비밀번호는 최소 8자, 최대 20자, 영문, 숫자, 특수문자를 모두 포함해야 합니다.',
  })
  password: string;

  @ApiProperty({ example: '루돌이', description: '닉네임' })
  @IsString({ message: '닉네임은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '닉네임은 필수 입력 항목입니다.' })
  @Matches(/^[가-힣a-zA-Z0-9]{2,8}$/, {
    message:
      '닉네임은 2~8자의 한글, 영어, 숫자만 사용 가능하며, 공백, 특수문자, 이모티콘은 허용되지 않습니다.',
  })
  nickname: string;

  @ApiProperty({ example: 20850, description: '우편번호' })
  @IsInt({ message: '우편번호는 정수여야 합니다.' })
  @Min(10000, { message: '유효하지 않은 우편번호 형식입니다.' })
  @Max(99999, { message: '유효하지 않은 우편번호 형식입니다.' })
  zipCode: number;
}
