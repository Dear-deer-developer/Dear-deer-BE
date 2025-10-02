import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentRepository } from './content.repository';
import { ContentsQueryDto } from './dtos/contents-query.dto';
import { S3Service } from 'src/s3/s3.service';
import { CreateContentDto } from './dtos/create-content.dto';

@Injectable()
export class ContentService {
  constructor(
    private readonly contentRepository: ContentRepository,
    private readonly s3Service: S3Service,
  ) {}

  /** 공개된 콘텐츠 리스트 조회 (카테고리 필터링) */
  async findAllPublishedContents(query: ContentsQueryDto) {
    const { mainCategoryId, subCategoryId } = query;

    if (
      mainCategoryId &&
      !(await this.contentRepository.existMainCategory(+mainCategoryId))
    ) {
      throw new NotFoundException(
        `존재하지 않는 메인 카테고리입니다: ${mainCategoryId}`,
      );
    }

    if (
      subCategoryId &&
      !(await this.contentRepository.existSubCategory(+subCategoryId))
    ) {
      throw new NotFoundException(
        `존재하지 않는 서브 카테고리입니다: ${subCategoryId}`,
      );
    }

    return this.contentRepository.findAllPublished(
      mainCategoryId,
      subCategoryId,
    );
    return this.contentRepository.findAllPublished();
  }

  /** 특정 공개된 콘텐츠 상세 조회 */
  async findOnePublishedContent(contentId: number) {
    const content = await this.contentRepository.findOnePublished(contentId);

    if (!content) {
      throw new NotFoundException('게시된 콘텐츠를 찾을 수 없습니다.');
    }
    return content;
  }

  /** 콘텐츠 등록 (관리자 전용) */
  async createContent(
    authorId: number,
    createContentDto: CreateContentDto,
  ): Promise<{
    contentId: number;
    presignedUrls: { url: string; key: string }[];
  }> {
    const { title, content, subCategoryId, images } = createContentDto;

    // 1. 카테고리 유효성 검사 (Optional)
    if (!(await this.contentRepository.existSubCategory(subCategoryId))) {
      throw new NotFoundException(
        `존재하지 않는 서브 카테고리 ID입니다: ${subCategoryId}`,
      );
    }

    // 2. S3 Presigned URL 생성 (업로드 전에 key를 먼저 받아야 한다)
    const s3Files = images.map((img) => ({
      originalFileName: img.filename,
      contentType: img.contentType,
    }));

    // S3에 업로드할 이미지 파일 정보 목록을 가져옵니다.
    const presignedUrls =
      await this.s3Service.generateContentImagePresignedUrls(authorId, s3Files);

    // 3. DB에 Content 및 ContentImage 저장
    const createdContent = await this.contentRepository.createContent({
      authorId,
      subCategoryId,
      title,
      body: content,
      // DB에 저장할 이미지 URL (S3 key) 목록
      images: presignedUrls.map((res) => ({ url: res.key })),
    });

    // 4. Content ID와 Presigned URL 목록 반환
    return {
      contentId: createdContent.id,
      presignedUrls: presignedUrls,
    };
  }
}
