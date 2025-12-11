import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Content, ContentStatus, Prisma } from '@prisma/client';

@Injectable()
export class ContentRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly subCategorySelect = {
    id: true,
    name: true,
    mainCategory: {
      select: {
        id: true,
        name: true,
      },
    },
  };

  // ===================================================================
  // 🧑🏻일반 사용자용 API🧑🏻
  // ===================================================================

  /** (사용자) 전체 공개 콘텐츠 리스트 조회 */
  async findAllPublished(mainCategoryId?: string, subCategoryId?: string) {
    const where: Prisma.ContentWhereInput = {
      status: ContentStatus.PUBLISHED,
    };

    if (subCategoryId) where.subCategoryId = +subCategoryId;
    else if (mainCategoryId)
      where.subCategory = { mainCategoryId: +mainCategoryId };

    return this.prisma.content.findMany({
      where,
      include: {
        images: {
          take: 1,
          orderBy: {
            createdAt: 'asc',
          },
        },
        author: {
          select: { id: true, nickname: true },
        },
        subCategory: {
          select: this.subCategorySelect,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** (사용자) 특정 공개 콘텐츠 상세 조회 */
  async findOnePublished(contentId: number) {
    return this.prisma.content.findUnique({
      where: {
        id: contentId,
        status: ContentStatus.PUBLISHED,
      },
      include: {
        images: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        author: {
          select: { id: true, nickname: true },
        },
        subCategory: {
          select: this.subCategorySelect,
        },
      },
    });
  }

  // ===================================================================
  // 공용 (CRUD)
  // ===================================================================

  /** 메인 카테고리 존재 여부 확인 */
  async existMainCategory(id: number): Promise<boolean> {
    return (await this.prisma.contentMainCategory.count({ where: { id } })) > 0;
  }

  /** 서브 카테고리 존재 여부 확인 */
  async existSubCategory(id: number): Promise<boolean> {
    return (await this.prisma.contentSubCategory.count({ where: { id } })) > 0;
  }

  // ===================================================================
  // ⚙️관리자 전용 API⚙️
  // ===================================================================

  /** (관리자) 콘텐츠 목록 조회 */
  async findAllForAdmin(status?: ContentStatus) {
    const where: Prisma.ContentWhereInput = {};
    if (status) {
      where.status = status;
    }

    return this.prisma.content.findMany({
      where,
      include: {
        images: {
          take: 1,
          orderBy: { createdAt: 'asc' },
        },
        author: {
          select: { id: true, nickname: true },
        },
        subCategory: {
          select: this.subCategorySelect,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** (관리자) 콘텐츠 상세 조회 */
  async findOneForAdmin(contentId: number) {
    return this.prisma.content.findUnique({
      where: {
        id: contentId,
      },
      include: {
        images: {
          orderBy: { createdAt: 'asc' },
        },
        author: {
          select: { id: true, nickname: true },
        },
        subCategory: {
          select: this.subCategorySelect,
        },
      },
    });
  }

  /** (관리자) 콘텐츠 등록 */
  async createContent(data: {
    authorId: number;
    subCategoryId: number;
    title: string;
    body: string;
    status: ContentStatus;
  }) {
    return this.prisma.content.create({
      data: {
        authorId: data.authorId,
        subCategoryId: data.subCategoryId,
        title: data.title,
        body: data.body,
        status: data.status,
      },
    });
  }

  /** 이미지들을 콘텐츠에 추가 */
  async addContentImages(
    contentId: number,
    images: { url: string }[],
  ): Promise<void> {
    if (!images || images.length === 0) return;

    await this.prisma.contentImage.createMany({
      data: images.map((img) => ({
        contentId: contentId,
        url: img.url,
      })),
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

  /** contentId로 콘텐츠 조회 (수정, 삭제 로직에서 사용) */
  async findContentByIdWithImages(contentId: number) {
    return this.prisma.content.findUnique({
      where: { id: contentId },
      include: {
        images: true,
      },
    });
  }

  /** (관리자) 콘텐츠 삭제 (트랜잭션) */
  async deleteContent(contentId: number) {
    return this.prisma.content.delete({
      where: { id: contentId },
    });
  }
}
