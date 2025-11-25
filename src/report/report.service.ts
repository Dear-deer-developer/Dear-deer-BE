import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateReportDto } from './dtos/create-report.dto';
import { BanUserDto } from './dtos/ban-user.dto';
import { ReportRepository } from './report.repository';

@Injectable()
export class ReportService {
  constructor(private readonly reportRepository: ReportRepository) {}

  // [User] 신고하기
  async reportUser(userId: number, dto: CreateReportDto) {
    // 추가 로직: 본인이 본인을 신고하는지 체크 등
    if (userId === dto.targetUserId) {
      throw new BadRequestException('본인은 신고할 수 없습니다.');
    }

    return this.reportRepository.createReportWithMutualBlock(userId, dto);
  }

  // [Admin] 신고 목록 보기
  async getPendingReports() {
    return this.reportRepository.findAllPendingReports();
  }

  // [Admin] 유저 밴 하기
  async banUser(dto: BanUserDto) {
    const existingBan = await this.reportRepository.findBanByUserId(dto.userId);

    if (existingBan) {
      // 이미 밴 기록이 있다면 400 Bad Request 에러 발생
      throw new BadRequestException(
        `해당 사용자(ID: ${dto.userId})는 이미 밴 처리되었습니다. (사유: ${existingBan.reason})`,
      );
    }
    return this.reportRepository.banUser(dto);
  }
}
