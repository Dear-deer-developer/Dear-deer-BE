import { ApiProperty } from '@nestjs/swagger';
import {
  GiftCategory,
  GiftCategoryValue,
} from 'src/common/enums/gift-category.enum';

/**
 * 장착된 선물 조회 (GET) 또는
 * 장착 상태 업데이트 응답 (PUT)용 DTO
 */
export class ResEquippedGiftDto {
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
