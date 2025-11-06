import { ApiProperty } from '@nestjs/swagger';
import { AuthorDto } from './content-author.dto';
import { SubCategoryDto } from './content-category.dto';

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
    example: ['contents/1/10/uuid1.jpg', 'contents/1/10/uuid2.png'],
    description: '콘텐츠 이미지 S3 Key 목록 (전체)',
  })
  images: string[];

  @ApiProperty({ description: '콘텐츠 생성 일시' })
  createdAt: Date;
}
