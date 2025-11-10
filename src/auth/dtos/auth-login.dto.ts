import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthLoginDto {
  @ApiProperty({ example: 'deardeer@gmail.com', description: '이메일' })
  @IsEmail({}, { message: '유효한 이메일 형식이 아닙니다.' })
  email: string;

  @ApiProperty({ example: 'qlalfqjsgh1@', description: '비밀번호' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
