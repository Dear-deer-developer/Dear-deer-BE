import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReportDto } from './dtos/create-report.dto';
import { BanUserDto } from './dtos/ban-user.dto';
import { ReportRepository } from './report.repository';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class ReportService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly s3Service: S3Service,
  ) {}

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

  // [Admin] 신고 상세 조회
  async getReportDetail(reportId: number) {
    const report = await this.reportRepository.findReportDetail(reportId);
    if (!report) {
      throw new NotFoundException('해당 신고 내역을 찾을 수 없습니다.');
    }

    let presignedUrl: string | null = null;

    if (report.letter && report.letter.imageUrl) {
      presignedUrl = await this.s3Service.generateGetObjectPresignedUrl(
        report.letter.imageUrl,
      );
    }
    // 응답 데이터 구조 재구성
    // (Prisma 결과의 letter 객체에 presignedUrl을 넣어주고 imageUrl은 숨김)
    const { letter, ...reportData } = report;

    return {
      ...reportData,
      letter: letter
        ? {
            id: letter.id,
            content: letter.content,
            sentAt: letter.sentAt,
            presignedUrl: presignedUrl, // [핵심] 생성된 URL 주입
          }
        : null, // 편지가 삭제되었거나 없는 경우 null
    };
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

  /**
   * [Admin] 신고 반려 (밴 하지 않고 처리 완료로 변경)
   */
  async dismissReport(reportId: number) {
    // 해당 신고가 존재하는지 확인
    const report = await this.reportRepository.findReportById(reportId);
    if (!report) {
      throw new NotFoundException('존재하지 않는 신고 내역입니다.');
    }

    if (report.isResolved) {
      throw new BadRequestException('이미 처리된 신고 내역입니다.');
    }

    // Repository를 통해 상태만 업데이트 (isResolved -> true)
    return this.reportRepository.updateReportStatus(reportId, true);
  }
}
