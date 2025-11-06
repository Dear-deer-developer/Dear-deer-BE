import { ApiProperty } from '@nestjs/swagger';

export class MainCategoryDto {
  @ApiProperty({ example: 1, description: '메인 카테고리 ID' })
  id: number;

  @ApiProperty({ example: '콘텐츠 추천', description: '메인 카테고리 이름' })
  name: string;
}

export class SubCategoryDto {
  @ApiProperty({ example: 5, description: '서브 카테고리 ID' })
  id: number;

  @ApiProperty({ example: '티켓팅/예약', description: '서브 카테고리 이름' })
  name: string;

  @ApiProperty({ description: '상위 메인 카테고리 정보' })
  mainCategory: MainCategoryDto;
}
