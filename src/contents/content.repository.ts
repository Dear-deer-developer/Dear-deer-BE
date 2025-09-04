// src/contents/contents.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Content, ContentStatus } from '@prisma/client';

@Injectable()
export class ContentRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** 전체 공개 콘텐츠 리스트 조회 */
  async findAllPublished(): Promise<Content[]> {
    return this.prisma.content.findMany({
      where: {
        status: ContentStatus.PUBLISHED,
      },
      include: {
        subCategory: {
          include: {
            mainCategory: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /** 특정 공개 콘텐츠 상세 조회 */
  async findOnePublished(contentId: number): Promise<Content | null> {
    return this.prisma.content.findUnique({
      where: {
        id: contentId,
        status: ContentStatus.PUBLISHED,
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
          },
        },
        subCategory: {
          select: {
            id: true,
            name: true,
            mainCategory: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }
}
