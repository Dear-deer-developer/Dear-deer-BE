import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GiftRepository } from './gift.repository';
import {
  categoryRankMap,
  GiftCategory,
} from 'src/common/enums/gift-category.enum';
import { UpdateEquippedDto } from './dtos/update-equipped.dto';
import { ResEquippedGiftDto } from './dtos/res-equipped-gift.dto';
import { ResGiftDto } from './dtos/res-gift.dto';

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

  async getEquippedGifts(userId: number): Promise<ResEquippedGiftDto[]> {
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
  ): Promise<ResEquippedGiftDto[]> {
    return this.giftRepository.updateEquippedGifts(userId, dto.equipment);
  }

  ///////// 아래는 개발시 사용 /////////
  async getAllGifts(): Promise<ResGiftDto[]> {
    return this.giftRepository.findAll();
  }

  async getGiftsByCategory(category: GiftCategory): Promise<ResGiftDto[]> {
    return this.giftRepository.findByCategory(category);
  }

  // 내가 가진 선물 추가
  async createMyGift(userId: number, giftId: number): Promise<any> {
    // 이미 가지고 있는지 확인
    const existing = await this.giftRepository.findMyGiftByGiftId(giftId);
    if (existing) {
      throw new ConflictException('이미 가지고 있는 선물입니다.');
    }

    // 생성
    return this.giftRepository.createMyGift(userId, giftId);
  }

  // 내가 가진 선물 삭제
  async deleteMyGift(userId: number, giftId: number): Promise<void> {
    // 선물이 존재하는지 확인
    const gift = await this.giftRepository.findMyGiftByGiftId(giftId);
    if (!gift) {
      throw new NotFoundException(`ID가 ${giftId}인 선물을 찾을 수 없습니다.`);
    }

    // 삭제
    try {
      await this.giftRepository.deleteMyGift(userId, giftId);
    } catch (error) {
      // P2003: Foreign key constraint failed
      if (error.code === 'P2003') {
        throw new ConflictException(
          '이 선물은 이미 유저가 보유/장착 중이라 삭제할 수 없습니다.',
        );
      }
      throw error; // 기타 에러
    }
  }
}
