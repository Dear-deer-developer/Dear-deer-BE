import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Platform } from '@prisma/client';

export class RegisterFcmTokenDto {
  @ApiProperty({ description: 'FCM registration token' })
  @IsString()
  token!: string;

  @ApiProperty({ enum: Platform, description: '디바이스 플랫폼' })
  @IsEnum(Platform)
  platform!: Platform; // IOS | ANDROID | OTHER
}
