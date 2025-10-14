import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class AuthRegisterDto {
  @IsEmail({}, { message: '유효한 이메일 형식이 아닙니다.' })
  @IsNotEmpty({ message: '이메일은 필수 입력 항목입니다.' })
  email: string;

  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '비밀번호는 필수 입력 항목입니다.' })
  @Length(8, 20, { message: '비밀번호는 최소 8자, 최대 20자여야 합니다.' })
  password: string;

  @IsString({ message: '닉네임은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '닉네임은 필수 입력 항목입니다.' })
  @Length(2, 10, { message: '닉네임은 2자 이상 10자 이하여야 합니다.' })
  nickname: string;

  @IsInt({ message: '우편번호는 정수여야 합니다.' })
  @Min(10000, { message: '유효하지 않은 우편번호 형식입니다.' })
  @Max(99999, { message: '유효하지 않은 우편번호 형식입니다.' })
  zipCode: number;
}
