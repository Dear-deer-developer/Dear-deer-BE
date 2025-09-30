// src/contents/contents.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Content, ContentStatus } from '@prisma/client';

@Injectable()
export class ContentRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** 전체 공개 콘텐츠 리스트 조회 */
  async findAllPublished(
    mainCategoryId?: string,
    subCategoryId?: string,
  ): Promise<Content[]> {
    if (subCategoryId) {
      return this.prisma.content.findMany({
        where: {
          status: ContentStatus.PUBLISHED,
          subCategoryId: +subCategoryId,
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

    if (mainCategoryId) {
      return this.prisma.content.findMany({
        where: {
          status: ContentStatus.PUBLISHED,
          subCategory: {
            mainCategoryId: +mainCategoryId,
          },
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

  /** 메인 카테고리 존재 여부 확인 */
  async existMainCategory(id: number): Promise<boolean> {
    return (await this.prisma.contentMainCategory.count({ where: { id } })) > 0;
  }

  /** 서브 카테고리 존재 여부 확인 */
  async existSubCategory(id: number): Promise<boolean> {
    return (await this.prisma.contentSubCategory.count({ where: { id } })) > 0;
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
