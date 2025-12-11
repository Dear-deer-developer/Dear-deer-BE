import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ScrapRepository } from './scrap.repository';
import { Prisma } from '@prisma/client';
import { ContentRepository } from 'src/contents/content.repository';
import { MyScrapDto } from './dtos/my-scrap.dto';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class ScrapService {
  constructor(
    private readonly scrapRepository: ScrapRepository,
    private readonly contentRepository: ContentRepository,
    private readonly s3Service: S3Service,
  ) {}

  /** 스크랩 생성 */
  async createScrap(userId: number, contentId: number): Promise<void> {
    // 1. 콘텐츠가 PUBLISHED 상태로 존재하는지 확인
    const content = await this.contentRepository.findOnePublished(contentId);
    if (!content) {
      throw new NotFoundException('게시된 콘텐츠를 찾을 수 없습니다.');
    }

    // 2. 스크랩 생성 시도
    try {
      await this.scrapRepository.create(userId, contentId);
    } catch (error) {
      // 3. Unique 제약 조건 위반 시 (이미 스크랩한 경우)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002' //db에서 중복데이터 삽입 시도 시 발생하는 코드
      ) {
        throw new ConflictException('이미 스크랩한 콘텐츠입니다.');
      }
      throw error;
    }
  }

  /** 스크랩 삭제 */
  async deleteScrap(userId: number, contentId: number): Promise<void> {
    const affectedRows = await this.scrapRepository.delete(userId, contentId);

    // 삭제할 대상이 없음
    if (affectedRows === 0) {
      throw new NotFoundException('스크랩한 기록을 찾을 수 없습니다.');
    }
  }

  /** 내 스크랩 목록 조회 */
  async findMyScraps(userId: number): Promise<MyScrapDto[]> {
    const scraps = await this.scrapRepository.findManyByUserId(userId);

    return Promise.all(
      scraps.map(async (scrap) => {
        const imageKey = scrap.content.images[0]?.url || null;
        let thumbnailUrl: string | null = null;

        if (imageKey) {
          try {
            thumbnailUrl =
              await this.s3Service.generateGetObjectPresignedUrl(imageKey);
          } catch (e) {
            console.error(`S3 Error (Scrap ID: ${scrap.id}):`, e);
            thumbnailUrl = null;
          }
        }

        return {
          scrapId: scrap.id,
          contentId: scrap.content.id,
          title: scrap.content.title,
          thumbnail: thumbnailUrl,
          subCategory: scrap.content.subCategory,
          scrappedAt: scrap.createdAt,
        };
      }),
    );
  }
}
