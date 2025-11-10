import {
  Controller,
  Delete,
  HttpCode,
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
import { ResTestSantaLetterDto } from './dtos/res-test-santa-letter.dto';

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

  // 산타편지 테스트용
  @Post('test-santa')
  @ApiCalendarReward.sendTestSanta() // 👈 Swagger 적용 (4번에서 생성)
  @HttpCode(201) // 👈 새 리소스 생성
  async sendTestSantaLetter(
    @GetUserId() userId: number,
  ): Promise<ResTestSantaLetterDto> {
    return this.calendarRewardService.sendTestSantaLetter(userId);
  }
}
