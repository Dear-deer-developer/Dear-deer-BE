import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { ReportRepository } from './report.repository';
import { S3Module } from 'src/s3/s3.module';

@Module({
  imports: [S3Module],
  providers: [ReportService, ReportRepository],
  controllers: [ReportController],
  exports: [ReportRepository],
})
export class ReportModule {}
