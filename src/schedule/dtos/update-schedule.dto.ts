import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import {
  ScheduleCategory,
  ScheduleCategoryValue,
} from 'src/common/enums/schedule-category.enum';

export class UpdateScheduleDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  memo?: string;

  @ApiProperty({ enum: ScheduleCategoryValue, required: false })
  @IsOptional()
  @IsEnum(ScheduleCategoryValue)
  category?: ScheduleCategory;

  @ApiProperty({ required: false, example: '2025-07-15T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  date?: string;
}
