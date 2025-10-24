import { IsArray, IsEnum, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GiftCategory } from '@prisma/client';

// PUT 요청 Body의 'equipment' 배열 안의 개별 아이템
export class EquipmentGiftDto {
  @IsInt()
  giftId: number;

  @IsEnum(GiftCategory)
  category: GiftCategory;

  @IsInt()
  slot: number;
}

// PUT 요청 Body
export class UpdateEquippedDto {
  @IsArray()
  @ValidateNested({ each: true }) // 배열의 각 요소를 검증
  @Type(() => EquipmentGiftDto) // 배열 요소를 DTO로 변환
  equipment: EquipmentGiftDto[];
}
