import { Controller, Get, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { AdminGuard } from 'src/admin/admin.guard';

@Controller('admin')
export class AdminController {
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  @Get('dashboard')
  getAdminDashboard() {
    return { message: '🎉 관리자 전용 대시보드입니다' };
  }
}
