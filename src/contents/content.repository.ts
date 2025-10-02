// src/contents/contents.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Content, ContentStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

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

  async createContent(data: {
    authorId: number;
    subCategoryId: number;
    title: string;
    body: string;
    images: { url: string }[];
  }) {
    const { images, ...contentData } = data;

    return this.prisma.content.create({
      data: {
        ...contentData,
        status: ContentStatus.PUBLISHED, // 관리자 등록 시 바로 게시
        // ContentImage 모델에 연결하여 여러 장 저장
        images: {
          createMany: {
            data: images.map((img) => ({ url: img.url })),
          },
        },
      },
      include: {
        images: true, // 생성된 이미지 목록을 포함하여 반환
      },
    });
  }

  async updateContent(
    contentId: number,
    updateData: Prisma.ContentUpdateInput,
    newImageUrls: string[], // 새로 추가될 이미지 URL (S3 Key) 목록
    imageKeysToRemove: string[], // 삭제할 기존 이미지 URL (S3 Key) 목록
  ) {
    // 1. 콘텐츠 및 이미지 업데이트 트랜잭션
    return this.prisma.$transaction(async (tx) => {
      // 1-1. 기존 콘텐츠 이미지 삭제 (삭제 목록에 있는 것들)
      if (imageKeysToRemove.length > 0) {
        await tx.contentImage.deleteMany({
          where: {
            contentId: contentId,
            url: { in: imageKeysToRemove },
          },
        });
      }

      // 1-2. 새로운 이미지 추가
      const newImages = newImageUrls.map((url) => ({
        contentId: contentId,
        url: url,
      }));

      if (newImages.length > 0) {
        await tx.contentImage.createMany({
          data: newImages,
        });
      }

      // 1-3. 콘텐츠 본문 업데이트
      const updatedContent = await tx.content.update({
        where: { id: contentId },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        include: {
          images: true, // 업데이트된 이미지 목록 포함 반환
        },
      });

      return updatedContent;
    });
  }

  /** contentId로 콘텐츠 조회 (수정 로직에서 사용) */
  async findContentByIdWithImages(contentId: number) {
    return this.prisma.content.findUnique({
      where: { id: contentId },
      include: {
        images: true,
      },
    });
  }
}
