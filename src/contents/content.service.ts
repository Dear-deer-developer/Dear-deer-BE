import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentRepository } from './content.repository';
import { ContentsQueryDto } from './dtos/contents-query.dto';

@Injectable()
export class ContentService {
  constructor(private readonly contentRepository: ContentRepository) {}

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
}
