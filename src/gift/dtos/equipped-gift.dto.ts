// src/my-room/dto/equipped-item.dto.ts
import { GiftCategory } from '@prisma/client';

// GET 응답용 DTO
export class EquippedGiftDto {
  giftId: number;
  category: GiftCategory;
  slot: number;
}
