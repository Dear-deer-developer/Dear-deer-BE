import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ example: 'deardeer@gmail.com', description: '이메일' })
  @IsEmail({}, { message: '유효한 이메일 형식이 아닙니다.' })
  @IsNotEmpty({ message: '이메일은 필수 입력 항목입니다.' })
  email: string;

  @ApiProperty({ example: 'qlalfqjsgh', description: '비밀번호' })
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '비밀번호는 필수 입력 항목입니다.' })
  @Length(8, 20, { message: '비밀번호는 최소 8자, 최대 20자여야 합니다.' })
  password: string;

  @ApiProperty({ example: '루돌이', description: '닉네임' })
  @IsString({ message: '닉네임은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '닉네임은 필수 입력 항목입니다.' })
  @Length(2, 10, { message: '닉네임은 2자 이상 10자 이하여야 합니다.' })
  nickname: string;

  @ApiProperty({ example: 20850, description: '우편번호' })
  @IsInt({ message: '우편번호는 정수여야 합니다.' })
  @Min(10000, { message: '유효하지 않은 우편번호 형식입니다.' })
  @Max(99999, { message: '유효하지 않은 우편번호 형식입니다.' })
  zipCode: number;
}

// export class SendLetterDto {
//   @ApiProperty({ example: 17, description: '보내는 사람 ID' })
//   @IsInt()
//   senderId: number;

//   @ApiPropertyOptional({
//     example: 2,
//     description: '받는 사람 ID (없을 수도 있음)',
//   })
//   @IsOptional()
//   @IsInt()
//   receiverId?: number;

//   @ApiProperty({ example: '안녕하세요!', description: '편지 내용' })
//   @IsString()
//   @IsNotEmpty()
//   @Length(1, 500)
//   content: string;

//   @ApiPropertyOptional({
//     example: 'letters/test-image.png',
//     description: '이미지 URL',
//   })
//   @IsOptional()
//   @IsString()
//   imageUrl?: string;
// }
