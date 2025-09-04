import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentRepository } from './content.repository';

@Injectable()
export class ContentService {
  constructor(private readonly contentRepository: ContentRepository) {}

  /** 전체 공개된 콘텐츠 리스트 조회 */
  async findAllPublishedContents() {
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
