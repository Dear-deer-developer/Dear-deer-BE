import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { AlarmService } from './alarm.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { CreateAlarmDto } from './dtos/create-alarm.dto';
import { UpdateAlarmDto } from './dtos/update-alarm.dto';
import { ApiAlarm } from './alarm.swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetUserId } from 'src/auth/decorators/get-user-id.decorator';

@ApiTags('alarms')
@ApiBearerAuth()
@UseGuards(AuthGuard('accessToken'))
@Controller('alarms')
export class AlarmController {
  constructor(private readonly alarmService: AlarmService) {}

  @Post()
  @ApiAlarm.create()
  async create(@GetUserId() userId: number, @Body() dto: CreateAlarmDto) {
    return await this.alarmService.create(userId, dto);
  }

  // 본인 id 의 알람을 조회
  @Get('me')
  @ApiAlarm.getMy()
  async findOne(@GetUserId() userId: number) {
    return await this.alarmService.findOne(userId);
  }

  @Patch('me')
  @ApiAlarm.update()
  async update(@GetUserId() userId: number, @Body() dto: UpdateAlarmDto) {
    return await this.alarmService.update(userId, dto);
  }

  @Delete('me')
  @HttpCode(204)
  @ApiAlarm.delete()
  async remove(@GetUserId() userId: number) {
    await this.alarmService.delete(userId);
  }
}
