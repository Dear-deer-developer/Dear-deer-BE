import { IsDateString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAlarmDto {
  @ApiProperty({ example: '2025-12-24T08:10:00Z' })
  @IsDateString()
  scheduledAt: string;

  @ApiProperty({ example: 1, description: '선택한 음악의 기본키(Music.id)' })
  @IsInt()
  @Min(1)
  musicId: number;
}
