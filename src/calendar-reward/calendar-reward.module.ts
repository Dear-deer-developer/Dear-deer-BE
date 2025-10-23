import { Module } from '@nestjs/common';
import { CalendarRewardController } from './calendar-reward.controller';
import { CalendarRewardService } from './calendar-reward.service';
import { CalendarRewardRepository } from './calendar-reward.repository';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [UsersModule, AuthModule],
  controllers: [CalendarRewardController],
  providers: [CalendarRewardService, CalendarRewardRepository],
  exports: [CalendarRewardService],
})
export class CalendarRewardModule {}
