import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { ScheduleRepository } from './schedule.repository';

@Module({
  imports: [UsersModule],
  controllers: [ScheduleController],
  providers: [ScheduleService, ScheduleRepository],
  exports: [],
})
export class CalendarModule {}
