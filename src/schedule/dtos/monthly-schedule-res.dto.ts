import { ApiProperty } from '@nestjs/swagger';
import { ScheduleCategory } from 'src/common/enums/schedule-category.enum';

export class MonthlyScheduleResDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  category: ScheduleCategory;

  @ApiProperty()
  date: Date;
}
