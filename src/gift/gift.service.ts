import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateGiftDto } from './dtos/update-gift.dto';
import { CreateGiftDto } from './dtos/create-gift.dto';
import { GiftRepository } from './gift.repository';
import { GiftCategory } from 'src/common/enums/gift-category.enum';

@Injectable()
export class GiftService {
  constructor(private readonly giftRepository: GiftRepository) {}

  async findUserGifts(userId: number) {
    const myGifts = await this.giftRepository.findUserGifts(userId);
    const flattenedmyGifts = myGifts.map((item) => item.gift);
    return flattenedmyGifts;
  }

  async getAllGifts() {
    return this.giftRepository.findAll();
  }

  async getGiftsByCategory(category: GiftCategory) {
    return this.giftRepository.findByCategory(category);
  }
}
