import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AlarmService } from './alarm.service';

import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { CreateAlarmDto } from './dtos/create-alarm.dto';
import { UpdateAlarmDto } from './dtos/update-alarm.dto';
import { nowKST } from 'src/common/functions/time.helper';
import { ApiAlarm } from './alarm.swagger';

@ApiTags('alarms')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('alarms')
export class AlarmController {
  constructor(private readonly alarmService: AlarmService) {}

  @Post()
  @ApiAlarm.create()
  async create(@Req() req, @Body() dto: CreateAlarmDto) {
    return await this.alarmService.create(req.user.id, dto);
  }

  // 본인 id 의 알람을 조회
  @Get('my')
  @ApiAlarm.getMy()
  async findOne(@Req() req) {
    return await this.alarmService.findOne(req.user.id);
  }

  @Patch('my')
  @ApiAlarm.update()
  async update(@Req() req, @Body() dto: UpdateAlarmDto) {
    return await this.alarmService.update(req.user.id, dto);
  }

  @Delete('my')
  @ApiAlarm.delete()
  async remove(@Req() req) {
    return await this.alarmService.delete(req.user.id);
  }
}
