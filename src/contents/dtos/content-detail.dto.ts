import { ApiProperty } from '@nestjs/swagger';
import { AuthorDto } from './content-author.dto';
import { SubCategoryDto } from './content-category.dto';
import { ContentStatus } from '@prisma/client';

export class ContentDetailDto {
  @ApiProperty({ example: 1, description: '콘텐츠 ID' })
  id: number;

  @ApiProperty({ example: '첫 번째 콘텐츠 제목', description: '콘텐츠 제목' })
  title: string;

  @ApiProperty({
    example: '콘텐츠 본문 내용입니다...',
    description: '콘텐츠 본문 (HTML 또는 텍스트)',
  })
  body: string;

  @ApiProperty({ description: '작성자 정보' })
  author: AuthorDto;

  @ApiProperty({ description: '서브 카테고리 정보' })
  subCategory: SubCategoryDto;

  @ApiProperty({
    type: [String],
    example: [
      'https://s3-bucket.amazonaws.com/contents/1/10/uuid1.jpg',
      'https://s3-bucket.amazonaws.com/contents/1/10/uuid2.png',
    ],
    description: '콘텐츠 이미지 S3 Key 목록 (전체)',
  })
  images: string[];

  @ApiProperty({ description: '콘텐츠 생성 일시' })
  createdAt: Date;

  @ApiProperty({
    example: false,
    description: '(로그인 시) 현재 사용자의 스크랩 여부',
  })
  isScrapped: boolean;

  @ApiProperty({
    enum: ContentStatus,
    example: 'PUBLISHED',
    description: '콘텐츠 상태 (관리자 조회 시에만 유의미)',
    required: false,
  })
  status?: ContentStatus;
}
