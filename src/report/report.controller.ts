import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUserId } from 'src/auth/decorators/get-user-id.decorator';
import { CreateReportDto } from './dtos/create-report.dto';
import { BanUserDto } from './dtos/ban-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { ApiReports } from './report.swagger';

@Controller('reports')
@ApiTags('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // [User] 사용자 신고 API
  @Post()
  @UseGuards(AuthGuard('accessToken'))
  @ApiReports.create()
  async createReport(
    @GetUserId() userId: number,
    @Body() dto: CreateReportDto,
  ) {
    await this.reportService.reportUser(userId, dto);
    return {
      message: '신고가 접수되었으며, 해당 사용자와 상호 차단되었습니다.',
    };
  }

  // [Admin] 신고 목록 조회 API
  @Get('list')
  @UseGuards(AuthGuard('jwtAdmin')) // 관리자만 접근 가능하도록 설정
  @ApiReports.findAllPending()
  async getReports() {
    return this.reportService.getPendingReports();
  }

  // [Admin] 상세 조회 API (편지 내용 확인용)
  @Get(':reportId')
  @UseGuards(AuthGuard('jwtAdmin'))
  @ApiReports.findOne()
  async getReportDetail(@Param('reportId', ParseIntPipe) reportId: number) {
    return this.reportService.getReportDetail(reportId);
  }

  // [Admin] 유저 밴 API
  @Post('ban')
  @UseGuards(AuthGuard('jwtAdmin'))
  @ApiReports.banUser()
  async banUser(@Body() dto: BanUserDto) {
    await this.reportService.banUser(dto);
    return { message: '사용자가 성공적으로 밴 처리되었습니다.' };
  }

  // [Admin] 신고 반려 (무혐의) API
  @Post('/:reportId/dismiss')
  @UseGuards(AuthGuard('jwtAdmin'))
  @ApiReports.dismiss()
  async dismissReport(@Param('reportId', ParseIntPipe) reportId: number) {
    await this.reportService.dismissReport(reportId);
    return { message: '신고가 반려 처리되었습니다. (밴 없음, 차단 유지)' };
  }
}
