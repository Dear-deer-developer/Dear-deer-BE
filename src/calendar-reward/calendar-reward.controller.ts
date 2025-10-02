import {
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CalendarRewardService } from './calendar-reward.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiCalendarReward } from './calendar-reward.swagger';

@ApiTags('calendar-rewards')
@UseGuards(FirebaseAuthGuard)
@Controller('calendar-rewards')
export class CalendarRewardController {
  constructor(private readonly calendarRewardService: CalendarRewardService) {}

  // 선물 받았는지 확인
  @Post('enter')
  @ApiCalendarReward.enter()
  async enter(@Req() req: any) {
    const userId: number = req.user.id;
    return this.calendarRewardService.enterAndMaybeGrant(userId);
  }

  // 받은 선물 삭제 (개발용)
  @Delete(':giftId')
  @ApiCalendarReward.deleteGift()
  async deleteMyGift(
    @Req() req,
    @Param('giftId', ParseIntPipe) giftId: number,
  ) {
    const userId = req.user.id;
    return this.calendarRewardService.deleteGiftAndRecord(userId, giftId);
  }
}
