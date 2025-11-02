import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class AuthEmailDto {
  @ApiProperty({ example: 'deardeer@gmail.com', description: '이메일' })
  @IsEmail({}, { message: '유효한 이메일 형식이 아닙니다.' })
  email: string;
}
