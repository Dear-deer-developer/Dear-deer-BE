import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentRepository } from './content.repository';
import { ContentsQueryDto } from './dtos/contents-query.dto';
import { S3Service } from 'src/s3/s3.service';
import { CreateContentDto } from './dtos/create-content.dto';
import { UpdateContentDto } from './dtos/update-content.dto';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

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

  /** 콘텐츠 수정 (관리자 전용) */

  async updateContent(
    contentId: number,
    authorId: number,
    dto: UpdateContentDto,
  ): Promise<{
    contentId: number;
    presignedUrls: { url: string; key: string }[];
  }> {
    const { title, content, subCategoryId, currentImageKeys, newImages } = dto;

    // 1. 콘텐츠 존재 및 권한 확인 (등록한 관리자만 수정 가능하다고 가정)
    const existingContent =
      await this.contentRepository.findContentByIdWithImages(contentId);

    if (!existingContent) {
      throw new NotFoundException('수정할 콘텐츠를 찾을 수 없습니다.');
    }
    if (existingContent.authorId !== authorId) {
      // 보안상 ForbiddenException 대신 NotFound/Unauthorized를 고려할 수 있지만, 관리자 등록이므로 Forbidden도 적절
      throw new ForbiddenException('수정 권한이 없습니다.');
    }

    // 2. 최종 이미지 개수 유효성 검사
    const totalImageCount = currentImageKeys.length + newImages.length;
    if (totalImageCount < 1 || totalImageCount > 10) {
      throw new BadRequestException(
        `이미지는 최소 1장, 최대 10장까지 등록할 수 있습니다. (현재: ${totalImageCount}장)`,
      );
    }

    // 3. S3 이미지 삭제 및 업로드 키 준비
    const existingKeys = existingContent.images.map((img) => img.url);

    // DB에서 삭제할 키 목록 (기존 키 중 currentImageKeys에 없는 것)
    const imageKeysToDeleteFromS3 = existingKeys.filter(
      (key) => !currentImageKeys.includes(key),
    );

    // 4. S3 업로드용 Presigned URL 생성 (새 이미지에 대해서만)
    const s3Files = newImages.map((img) => ({
      originalFileName: img.filename,
      contentType: img.contentType,
    }));

    const presignedUrls =
      await this.s3Service.generateContentImagePresignedUrls(authorId, s3Files);

    // 5. DB 트랜잭션 처리 (삭제할 이미지와 새로 추가할 이미지 목록 전달)
    const contentUpdateData = {
      ...(subCategoryId !== undefined && { subCategoryId }),
      ...(title !== undefined && { title }),
      ...(content !== undefined && { body: content }),
    };

    // 카테고리 유효성 검사 (Optional)
    if (
      subCategoryId !== undefined &&
      !(await this.contentRepository.existSubCategory(subCategoryId))
    ) {
      throw new NotFoundException(
        `존재하지 않는 서브 카테고리 ID입니다: ${subCategoryId}`,
      );
    }

    const updatedContent = await this.contentRepository.updateContent(
      contentId,
      contentUpdateData, // 필터링된 객체 전달
      presignedUrls.map((res) => res.key),
      imageKeysToDeleteFromS3,
    );

    // 6. 실제 S3 이미지 삭제 (DB 트랜잭션 성공 후)
    if (imageKeysToDeleteFromS3.length > 0) {
      await this.s3Service.deleteObjects(imageKeysToDeleteFromS3);
    }

    // 7. 결과 반환 (새로 업로드할 이미지가 있다면 Presigned URL 반환)
    return {
      contentId: updatedContent.id,
      presignedUrls: presignedUrls,
    };
  }

  /** 콘텐츠 삭제 (관리자 전용) */
  async deleteContent(contentId: number, authorId: number): Promise<void> {
    // 1. 콘텐츠 존재 및 권한 확인 (등록된 관리자만 삭제 가능)
    const existingContent =
      await this.contentRepository.findContentByIdWithImages(contentId);

    if (!existingContent) {
      throw new NotFoundException('삭제할 콘텐츠를 찾을 수 없습니다.');
    }
    if (existingContent.authorId !== authorId) {
      // 등록 관리자가 아니면 권한 없음
      throw new ForbiddenException('삭제 권한이 없습니다.');
    }

    // 2. S3에서 삭제할 이미지 키 목록 추출
    const imageKeysToDelete = existingContent.images.map((img) => img.url);

    // 3. DB 트랜잭션을 통해 콘텐츠 및 이미지 레코드 삭제
    await this.contentRepository.deleteContent(contentId);

    // 4. S3 실제 파일 삭제 (DB 삭제가 성공했으므로)
    if (imageKeysToDelete.length > 0) {
      await this.s3Service.deleteObjects(imageKeysToDelete);
    }
  }
}
