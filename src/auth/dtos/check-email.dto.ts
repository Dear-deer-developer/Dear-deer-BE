import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CheckEmailDto {
  @ApiProperty({
    description: '중복 확인할 이메일 주소',
    example: 'test@example.com',
  })
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해 주세요.' })
  @IsNotEmpty({ message: '이메일은 필수 입력 항목입니다.' })
  email: string;
}
