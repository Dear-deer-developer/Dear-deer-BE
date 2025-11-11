import { ApiProperty } from '@nestjs/swagger';
import { SubCategoryDto } from 'src/contents/dtos/content-category.dto';

export class MyScrapDto {
  @ApiProperty({ description: '스크랩 고유 ID' })
  scrapId: number;

  @ApiProperty({ description: '콘텐츠 ID' })
  contentId: number;

  @ApiProperty({ description: '콘텐츠 제목' })
  title: string;

  @ApiProperty({ description: '콘텐츠 썸네일 S3 Key', nullable: true })
  thumbnail: string | null;

  @ApiProperty({ description: '서브 카테고리 정보' })
  subCategory: SubCategoryDto;

  @ApiProperty({ description: '스크랩한 일시' })
  scrappedAt: Date;
}
