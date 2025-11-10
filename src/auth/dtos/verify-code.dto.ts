import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerifyCodeDto {
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해 주세요.' })
  @IsNotEmpty({ message: '이메일은 필수 입력 항목입니다.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: '인증 코드는 필수 입력 항목입니다.' })
  code: string;
}
