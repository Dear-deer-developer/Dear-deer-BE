import { ApiProperty } from '@nestjs/swagger';
import { SubCategoryDto } from './content-category.dto';

export class ContentListItemDto {
  @ApiProperty({ example: 1, description: '콘텐츠 ID' })
  id: number;

  @ApiProperty({ example: '첫 번째 콘텐츠 제목', description: '콘텐츠 제목' })
  title: string;

  @ApiProperty({
    example: 'contents/1/10/uuid1.jpg',
    description: '콘텐츠 썸네일 이미지 S3 Key (첫 번째 이미지)',
    nullable: true,
  })
  thumbnail: string | null;

  @ApiProperty({ description: '서브 카테고리 정보' })
  subCategory: SubCategoryDto;

  @ApiProperty({ description: '콘텐츠 생성 일시' })
  createdAt: Date;
}
