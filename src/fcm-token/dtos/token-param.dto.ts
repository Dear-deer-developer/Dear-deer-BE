import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TokenParamDto {
  @ApiProperty({ description: '삭제 or 비활성화할 FCM 토큰' })
  @IsString()
  token!: string;
}
