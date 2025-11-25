import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { ReportRepository } from './report.repository';

@Module({
  providers: [ReportService, ReportRepository],
  controllers: [ReportController],
  exports: [ReportRepository],
})
export class ReportModule {}
