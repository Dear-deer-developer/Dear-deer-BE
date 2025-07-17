import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import {
  ScheduleCategory,
  ScheduleCategoryValue,
} from 'src/common/enums/schedule-category.enum';

export class CreateScheduleDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  memo?: string;

  @ApiProperty({ enum: ScheduleCategoryValue })
  @IsEnum(ScheduleCategoryValue)
  category: ScheduleCategory;

  @ApiProperty({ example: '2025-12-24' })
  @IsDateString()
  date: string;
}
