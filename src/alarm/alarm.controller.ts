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
  @Get('me')
  @ApiAlarm.getMy()
  async findOne(@Req() req) {
    return await this.alarmService.findOne(req.user.id);
  }

  @Patch('me')
  @ApiAlarm.update()
  async update(@Req() req, @Body() dto: UpdateAlarmDto) {
    return await this.alarmService.update(req.user.id, dto);
  }

  @Delete('me')
  @HttpCode(204)
  @ApiAlarm.delete()
  async remove(@Req() req) {
    await this.alarmService.delete(req.user.id);
  }
}
