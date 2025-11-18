import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentRepository } from './content.repository';
import { ContentsQueryDto } from './dtos/contents-query.dto';
import { S3Service } from 'src/s3/s3.service';
import { CreateContentDto } from './dtos/create-content.dto';
import { UpdateContentDto } from './dtos/update-content.dto';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ContentListItemDto } from './dtos/content-list-item.dto';
import { ContentDetailDto } from './dtos/content-detail.dto';
import { ScrapRepository } from 'src/scrap/scrap.repository';
import { ContentStatus, Prisma } from '@prisma/client';
import { AdminContentsQueryDto } from './dtos/admin-contents-query.dto';

@Injectable()
export class ContentService {
  constructor(
    private readonly contentRepository: ContentRepository,
    private readonly s3Service: S3Service,
    private readonly scrapRepository: ScrapRepository,
  ) {}

  // ===================================================================
  // 🧑🏻일반 사용자용 API🧑🏻
  // ===================================================================

  /** (사용자)공개된 콘텐츠 리스트 조회 */
  async findAllPublishedContents(
    query: ContentsQueryDto,
  ): Promise<ContentListItemDto[]> {
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

    const contents = await this.contentRepository.findAllPublished(
      mainCategoryId,
      subCategoryId,
    );

    return Promise.all(
      contents.map(async (content) => {
        const imageKey = content.images[0]?.url || null;
        let thumbnailUrl = null;

        if (imageKey) {
          thumbnailUrl =
            await this.s3Service.generateGetObjectPresignedUrl(imageKey);
        }

        //대표 이미지(thumbnail)만 썸네일로 나온다.
        return {
          id: content.id,
          title: content.title,
          thumbnail: thumbnailUrl,
          subCategory: content.subCategory,
          createdAt: content.createdAt,
        };
      }),
    );
  }

  /** (사용자) 특정 공개된 콘텐츠 상세 조회 (+ 스크랩 여부 포함) */
  async findOnePublishedContent(
    contentId: number,
    userId: number,
  ): Promise<ContentDetailDto> {
    const content = await this.contentRepository.findOnePublished(contentId);

    if (!content) {
      throw new NotFoundException('게시된 콘텐츠를 찾을 수 없습니다.');
    }

    //1. DB에 저장된 이미지 Key 목록 추출
    const imageKeys = content.images.map((img) => img.url);

    //2. Key들을 '조회 가능한 Presigned URL'로 변환한다. (병렬처리)
    const imageUrls = await Promise.all(
      imageKeys.map((key) => this.s3Service.generateGetObjectPresignedUrl(key)),
    );
    //3. 스크랩 여부 확인
    const scrapCount = await this.scrapRepository.count(userId, contentId);
    const isScrapped = scrapCount > 0;

    return {
      id: content.id,
      title: content.title,
      body: content.body,
      author: content.author,
      subCategory: content.subCategory,
      images: imageUrls,
      createdAt: content.createdAt,
      isScrapped,
    };
  }

  // ===================================================================
  // ⚙️관리자 전용 API⚙️
  // ===================================================================
  /** (관리자) 콘텐츠 목록 조회 */
  async findAllForAdmin(query: AdminContentsQueryDto) {
    const { status } = query;
    if (status && !Object.values(ContentStatus).includes(status)) {
      throw new BadRequestException('유효하지 않은 status 값입니다.');
    }

    const contents = await this.contentRepository.findAllForAdmin(status);

    return contents.map((content) => ({
      id: content.id,
      title: content.title,
      thumbnail: content.images[0]?.url || null,
      subCategory: content.subCategory,
      createdAt: content.createdAt,
      status: content.status, // 관리자용 목록에는 status(published/writing/hidden) 포함
    }));
  }

  /** (관리자) 콘텐츠 상세 조회 */
  async findOneForAdmin(contentId: number) {
    const content = await this.contentRepository.findOneForAdmin(contentId);

    if (!content) {
      throw new NotFoundException('콘텐츠를 찾을 수 없습니다.');
    }

    return {
      id: content.id,
      title: content.title,
      body: content.body,
      author: content.author,
      subCategory: content.subCategory,
      images: content.images.map((img) => img.url),
      createdAt: content.createdAt,
      isScrapped: false, // 관리자 조회 : 스크랩 여부 불필요
      status: content.status,
    };
  }

  /** (관리자) 콘텐츠 등록 */
  async createContentByAdmin(
    authorId: number,
    dto: CreateContentDto,
  ): Promise<{
    contentId: number;
    presignedUrls: { url: string; key: string }[];
  }> {
    const { title, content, subCategoryId, images, status } = dto;

    // 1. 카테고리 유효성 검사
    if (!(await this.contentRepository.existSubCategory(subCategoryId))) {
      throw new NotFoundException(
        `존재하지 않는 서브 카테고리 ID입니다: ${subCategoryId}`,
      );
    }

    // 2. 콘텐츠 생성 (contentId만 생성 , 이미지 없이)
    const createdContent = await this.contentRepository.createContent({
      authorId,
      subCategoryId,
      title,
      body: content,
      status,
    });

    // 3. S3 Presigned URL 생성 (-> contentId 이용한다)
    const s3Files = images.map((img) => ({
      originalFileName: img.originalFileName,
      contentType: img.contentType,
    }));

    // S3에 업로드할 이미지 파일 정보 목록 가져오기
    const presignedUrls =
      await this.s3Service.generateContentImagePresignedUrls(
        authorId,
        s3Files,
        createdContent.id, //contentId 전달
      );

    // 4. DB에 presigned URL로 생성된 key들을 저장
    await this.contentRepository.addContentImages(
      createdContent.id,
      presignedUrls.map((res) => ({ url: res.key })),
    );

    // 4. 결과 반환
    return {
      contentId: createdContent.id,
      presignedUrls,
    };
  }

  /** (관리자) 콘텐츠 수정 */

  async updateContentByAdmin(
    contentId: number,
    authorId: number,
    dto: UpdateContentDto,
  ): Promise<{
    contentId: number;
    presignedUrls: { url: string; key: string }[];
  }> {
    const {
      title,
      content,
      subCategoryId,
      status,
      currentImageKeys = [],
      newImages = [],
    } = dto;

    // 1. 콘텐츠 존재 및 권한 확인
    const existingContent =
      await this.contentRepository.findContentByIdWithImages(contentId);

    if (!existingContent) {
      throw new NotFoundException('수정할 콘텐츠를 찾을 수 없습니다.');
    }
    if (existingContent.authorId !== authorId) {
      throw new ForbiddenException('수정 권한이 없습니다.');
    }

    // 2. 최종 이미지 개수 유효성 검사 (0장 허용. status = WRITING 인 경우일 수 있어서(?))
    const totalImageCount = currentImageKeys.length + newImages.length;
    if (status === ContentStatus.PUBLISHED && totalImageCount < 1) {
      throw new BadRequestException(
        `PUBLISHED 상태는 이미지가 최소 1장 이상 필요합니다. (현재: ${totalImageCount}장)`,
      );
    }
    if (totalImageCount > 10) {
      throw new BadRequestException(
        `이미지는 최대 10장까지 등록할 수 있습니다. (현재: ${totalImageCount}장)`,
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
      originalFileName: img.originalFileName,
      contentType: img.contentType,
    }));

    const presignedUrls =
      await this.s3Service.generateContentImagePresignedUrls(
        authorId,
        s3Files,
        contentId,
      );

    // 5. DB 트랜잭션 처리 (삭제할 이미지와 새로 추가할 이미지 목록 전달)
    const updateData: Prisma.ContentUpdateInput = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.body = content;
    if (status !== undefined) updateData.status = status;
    if (subCategoryId !== undefined) {
      if (!(await this.contentRepository.existSubCategory(subCategoryId))) {
        throw new NotFoundException(
          `존재하지 않는 서브 카테고리 ID 입니다: ${subCategoryId}`,
        );
      }
      updateData.subCategory = { connect: { id: subCategoryId } };
    }

    const updatedContent = await this.contentRepository.updateContent(
      contentId,
      updateData,
      presignedUrls.map((p) => p.key),
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
  async deleteContentByAdmin(
    contentId: number,
    authorId: number,
  ): Promise<void> {
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
