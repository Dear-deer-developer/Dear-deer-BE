import { Module } from '@nestjs/common';
import { CalendarRewardController } from './calendar-reward.controller';
import { CalendarRewardService } from './calendar-reward.service';
import { CalendarRewardRepository } from './calendar-reward.repository';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [CalendarRewardController],
  providers: [CalendarRewardService, CalendarRewardRepository],
  exports: [CalendarRewardService],
})
export class CalendarRewardModule {}
