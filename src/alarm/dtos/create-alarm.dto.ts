import { IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAlarmDto {
  @ApiProperty({ example: '2025-12-24T08:10:00Z' })
  @IsDateString()
  scheduledAt: string;
}
