import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  GiftCategory,
  GiftCategoryValue,
} from 'src/common/enums/gift-category.enum';

// PUT 요청 Body의 'equipment' 배열 안의 개별 아이템
export class EquipmentGiftDto {
  @ApiProperty({
    description: '선물의 고유 ID',
    example: 7,
  })
  giftId: number;

  @ApiProperty({
    description: '선물의 카테고리',
    enum: GiftCategoryValue,
    example: 'ORNAMENT',
  })
  category: GiftCategory;

  @ApiProperty({
    description: '장착된 슬롯 번호 (1부터 시작)',
    example: 1,
  })
  slot: number;
}

// PUT 요청 Body
export class UpdateEquippedDto {
  @ApiProperty({
    description: '장착할 선물 아이템의 최종 목록',
    type: [EquipmentGiftDto],
  })
  @IsArray()
  @ValidateNested({ each: true }) // 배열의 각 요소를 검증
  @Type(() => EquipmentGiftDto) // 배열 요소를 DTO로 변환
  equipment: EquipmentGiftDto[];
}
