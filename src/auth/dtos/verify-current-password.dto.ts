import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyCurrentPasswordDto {
  @IsString()
  @IsNotEmpty({ message: '현재 비밀번호는 필수 입력 항목입니다.' })
  currentPassword: string;
}
