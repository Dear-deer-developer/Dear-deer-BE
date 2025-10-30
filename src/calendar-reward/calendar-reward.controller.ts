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
import { AuthGuard } from '@nestjs/passport';
import { GetUserId } from 'src/auth/decorators/get-user-id.decorator';
import { ResEnterCalendarDto } from './dtos/res-enter-calendar-reward.dto';

@ApiTags('calendar-rewards')
@UseGuards(AuthGuard('accessToken'))
@Controller('calendar-rewards')
export class CalendarRewardController {
  constructor(private readonly calendarRewardService: CalendarRewardService) {}

  // 선물 받았는지 확인
  @Post('enter')
  @ApiCalendarReward.enter()
  async enter(@GetUserId() userId: number): Promise<ResEnterCalendarDto> {
    return this.calendarRewardService.enterAndMaybeGrant(userId);
  }

  // 받은 선물 삭제 (개발용)
  @Delete(':giftId')
  @ApiCalendarReward.deleteGift()
  @UseGuards(AuthGuard('jwtAdmin'))
  async deleteMyGift(
    @GetUserId() userId: number,
    @Param('giftId', ParseIntPipe) giftId: number,
  ) {
    return this.calendarRewardService.deleteGiftAndRecord(userId, giftId);
  }
}
