import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { ReportService } from './report.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUserId } from 'src/auth/decorators/get-user-id.decorator';
import { CreateReportDto } from './dtos/create-report.dto';
import { BanUserDto } from './dtos/ban-user.dto';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // 1. [User] 사용자 신고 API
  @Post()
  @UseGuards(AuthGuard('accessToken'))
  async createReport(
    @GetUserId() userId: number,
    @Body() dto: CreateReportDto,
  ) {
    await this.reportService.reportUser(userId, dto);
    return {
      message: '신고가 접수되었으며, 해당 사용자와 상호 차단되었습니다.',
    };
  }

  // 2. [Admin] 신고 목록 조회 API
  @Get('admin/list')
  @UseGuards(AuthGuard('jwtAdmin')) // 관리자만 접근 가능하도록 설정
  async getReports() {
    return this.reportService.getPendingReports();
  }

  // 3. [Admin] 유저 밴 API
  @Post('admin/ban')
  @UseGuards(AuthGuard('jwtAdmin'))
  async banUser(@Body() dto: BanUserDto) {
    await this.reportService.banUser(dto);
    return { message: '사용자가 성공적으로 밴 처리되었습니다.' };
  }
}
