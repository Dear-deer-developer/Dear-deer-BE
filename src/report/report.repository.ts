import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Report, Ban, ReportReason } from '@prisma/client';
import { CreateReportDto } from './dtos/create-report.dto';
import { BanUserDto } from './dtos/ban-user.dto';

@Injectable()
export class ReportRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findBanByUserId(userId: number): Promise<Ban | null> {
    return this.prisma.ban.findUnique({
      where: { userId: userId },
    });
  }

  /**
   * [User]신고 생성 및 상호 차단 처리 (Transaction)
   */
  async createReportWithMutualBlock(
    reporterId: number,
    dto: CreateReportDto,
  ): Promise<Report> {
    return this.prisma.$transaction(async (tx) => {
      // 1. 신고 내역 생성
      const report = await tx.report.create({
        data: {
          reporterId: reporterId,
          reportedUserId: dto.targetUserId,
          letterId: dto.letterId,
          reason: dto.reason, // Enum 값 저장
        },
      });

      // 2. 상호 차단 생성 (서로의 글을 안 보이게 함)
      // createMany + skipDuplicates: true 조합으로 이미 차단된 경우 에러 없이 무시
      await tx.block.createMany({
        data: [
          { blockerId: reporterId, blockedId: dto.targetUserId },
          { blockerId: dto.targetUserId, blockedId: reporterId },
        ],
        skipDuplicates: true,
      });

      return report;
    });
  }

  /**
   * [Admin] 처리되지 않은 신고 내역 조회
   */
  async findAllPendingReports() {
    return this.prisma.report.findMany({
      where: { isResolved: false },
      select: {
        id: true,
        reason: true,
        isResolved: true,
        createdAt: true,
        reporter: {
          select: {
            id: true,
            nickname: true,
          },
        },
        reportedUser: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * [Admin] 처리된 신고 내역 조회
   */
  async findAllResolvedReports() {
    return this.prisma.report.findMany({
      where: { isResolved: true }, // 처리된 것만
      select: {
        id: true,
        reason: true,
        createdAt: true,
        updatedAt: true, // 처리된 시간

        reporter: {
          select: { id: true, nickname: true },
        },
        reportedUser: {
          select: {
            id: true,
            nickname: true,
            // 밴 정보가 있는지
            banInfo: {
              select: { id: true, bannedAt: true, reason: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' }, // 처리된 최신순
    });
  }

  /**
   * [Admin] 신고 단건 상세 조회 (편지 내용 포함)
   */
  async findReportDetail(reportId: number) {
    return this.prisma.report.findUnique({
      where: { id: reportId },
      // select를 사용하면 최상단의 reporterId, reportedUserId 등이 제외됩니다.
      select: {
        id: true,
        reason: true,
        createdAt: true,
        // isResolved: true, // 필요하다면 주석 해제 (요청하신 JSON에는 없어서 뺌)

        reporter: {
          select: {
            id: true,
            nickname: true,
            // email: true, // 필요 시 추가
          },
        },
        reportedUser: {
          select: {
            id: true,
            nickname: true,
          },
        },
        letter: {
          select: {
            id: true,
            content: true,
            imageUrl: true, // S3 URL 생성을 위해 필수
            sentAt: true,
          },
        },
      },
    });
  }

  /**
   * [Admin] 유저 밴 처리 및 신고 상태 업데이트 (Transaction)
   */
  async banUser(dto: BanUserDto): Promise<Ban> {
    return this.prisma.$transaction(async (tx) => {
      // 1. 밴 테이블에 기록
      const ban = await tx.ban.create({
        data: {
          userId: dto.userId,
          reason: dto.adminComment,
        },
      });

      // 2. 해당 유저에 대한 미처리 신고들을 모두 '처리됨'으로 변경
      await tx.report.updateMany({
        where: {
          reportedUserId: dto.userId,
          isResolved: false,
        },
        data: { isResolved: true },
      });

      return ban;
    });
  }

  /**
   * 신고 ID로 조회
   */
  async findReportById(reportId: number) {
    return this.prisma.report.findUnique({ where: { id: reportId } });
  }

  /**
   * 신고 처리 상태 업데이트
   */
  async updateReportStatus(reportId: number, isResolved: boolean) {
    return this.prisma.report.update({
      where: { id: reportId },
      data: { isResolved },
    });
  }

  /**
   * 두 사용자 간에 차단 관계가 존재하는지 확인 (양방향 체크)
   * true 반환 시: 서로 편지 전송/조회 불가
   */
  async checkBlockStatus(userId1: number, userId2: number): Promise<boolean> {
    const count = await this.prisma.block.count({
      where: {
        OR: [
          { blockerId: userId1, blockedId: userId2 }, // 1이 2를 차단
          { blockerId: userId2, blockedId: userId1 }, // 2가 1을 차단
        ],
      },
    });
    return count > 0;
  }
}
