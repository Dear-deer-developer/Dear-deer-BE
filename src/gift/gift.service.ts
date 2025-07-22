import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateGiftDto } from './dtos/update-gift.dto';
import { CreateGiftDto } from './dtos/create-gift.dto';
import { GiftRepository } from './gift.repository';
import { GiftCategory } from 'src/common/enums/gift-category.enum';

@Injectable()
export class GiftService {
  constructor(private readonly giftRepository: GiftRepository) {}

  async getAllGifts() {
    return this.giftRepository.findAll();
  }

  async getGiftById(id: number) {
    const gift = await this.giftRepository.findById(id);
    if (!gift) throw new NotFoundException('해당 Gift를 찾을 수 없습니다.');

    return gift;
  }

  async getGiftsByCategory(category: GiftCategory) {
    return this.giftRepository.findByCategory(category);
  }

  async createGift(dto: CreateGiftDto) {
    return this.giftRepository.create(dto);
  }

  async updateGift(id: number, dto: UpdateGiftDto) {
    const gift = await this.giftRepository.findById(id);
    if (!gift) throw new NotFoundException('해당 Gift를 찾을 수 없습니다.');

    return this.giftRepository.update(id, dto);
  }

  async deleteGift(id: number) {
    const gift = await this.giftRepository.findById(id);
    if (!gift) throw new NotFoundException('해당 Gift를 찾을 수 없습니다.');

    return this.giftRepository.delete(id);
  }
}
