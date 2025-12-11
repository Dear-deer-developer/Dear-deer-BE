import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ScrapRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** 스크랩 생성 */
  async create(userId: number, contentId: number) {
    return this.prisma.scrap.create({
      data: {
        userId,
        contentId,
      },
    });
  }

  /** 스크랩 삭제 */
  async delete(userId: number, contentId: number): Promise<number> {
    const result = await this.prisma.scrap.deleteMany({
      where: {
        userId,
        contentId,
      },
    });
    return result.count;
  }

  /** userId와 contentId로 스크랩 존재 여부 확인 (count) */
  async count(userId: number, contentId: number): Promise<number> {
    return this.prisma.scrap.count({
      where: {
        userId,
        contentId,
      },
    });
  }

  /** userId로 스크랩 목록 조회 (내 스크랩!) */
  async findManyByUserId(userId: number) {
    return this.prisma.scrap.findMany({
      where: { userId },
      include: {
        content: {
          include: {
            images: {
              take: 1, // 썸네일
              orderBy: { createdAt: 'asc' },
            },
            subCategory: {
              include: {
                mainCategory: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' }, // 최신 스크랩 순
    });
  }
}
