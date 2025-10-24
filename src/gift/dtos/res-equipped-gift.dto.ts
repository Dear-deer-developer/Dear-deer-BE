import { GiftCategory } from '@prisma/client';

/**
 * 장착된 선물 조회 (GET) 또는
 * 장착 상태 업데이트 응답 (PUT)용 DTO
 */
export class ResEquippedGiftDto {
  giftId: number;
  category: GiftCategory;
  slot: number;
}
