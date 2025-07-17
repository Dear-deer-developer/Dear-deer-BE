import { ApiProperty } from '@nestjs/swagger';
import {
  ScheduleCategory,
  ScheduleCategoryValue,
} from 'src/common/enums/schedule-category.enum';

export class DailyScheduleResDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  memo?: string;

  @ApiProperty({ enum: ScheduleCategoryValue })
  category: ScheduleCategory;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
