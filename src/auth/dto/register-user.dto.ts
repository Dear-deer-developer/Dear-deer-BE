import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({
    example: '123456789',
    description: '카카오에서 받은 고유 식별자 (providerId)',
  })
  @IsString()
  providerId: string;

  @ApiProperty({ example: '디어디어', description: '사용자가 입력한 닉네임' })
  @IsString()
  nickname: string;
}
