import { Injectable } from '@nestjs/common';
import { GiftRepository } from './gift.repository';
import {
  categoryRankMap,
  GiftCategory,
} from 'src/common/enums/gift-category.enum';
import { UpdateEquippedDto } from './dtos/update-equipped.dto';
import { EquippedGiftDto } from './dtos/equipped-gift.dto';

@Injectable()
export class GiftService {
  constructor(private readonly giftRepository: GiftRepository) {}

  async findUserGifts(userId: number) {
    const myGifts = await this.giftRepository.findUserGifts(userId);

    // 1. GIFT로 매핑합니다.
    const gifts = myGifts.map((userGift) => ({
      giftId: userGift.gift.id,
      name: userGift.gift.name,
      category: userGift.gift.category, // 이 카테고리 기준
    }));

    // 2. GIFT 배열을 'categoryRankMap' 기준으로 정렬합니다.
    gifts.sort((a, b) => {
      const rankA = categoryRankMap.get(a.category) ?? 99; // ?? 99 는 정렬 예외처리
      const rankB = categoryRankMap.get(b.category) ?? 99;
      return rankA - rankB;
    });

    // 3. 정렬된 GIFT 배열을 반환합니다.
    return gifts;
  }

  async getEquippedGifts(userId: number): Promise<EquippedGiftDto[]> {
    const gifts = await this.giftRepository.findEquippedGifts(userId);

    // 2. 반환하기 전에 'categoryRankMap' 기준으로 정렬합니다.
    gifts.sort((a, b) => {
      const rankA = categoryRankMap.get(a.category) ?? 99; // 혹시 모를 예외처리
      const rankB = categoryRankMap.get(b.category) ?? 99;
      return rankA - rankB; // 오름차순 정렬 (0, 1, 2...)
    });

    return gifts;
  }

  async updateEquippedGifts(
    userId: number,
    dto: UpdateEquippedDto,
  ): Promise<EquippedGiftDto[]> {
    return this.giftRepository.updateEquippedGifts(userId, dto.equipment);
  }

  ///////// 아래는 개발시 사용 /////////
  async getAllGifts() {
    return this.giftRepository.findAll();
  }

  async getGiftsByCategory(category: GiftCategory) {
    return this.giftRepository.findByCategory(category);
  }
}
