import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GiftCategory } from 'src/common/enums/gift-category.enum';
import { ResGiftDto } from './dtos/res-gift.dto';

@Injectable()
export class GiftRepository {
  constructor(private readonly prisma: PrismaService) {}

  // 나의 gifts 조회
  async findUserGifts(userId: number) {
    const myGifts = this.prisma.userGift.findMany({
      where: { userId },
      select: { gift: { select: { id: true, name: true, category: true } } },
    });
    return myGifts;
  }

  // 반환 타입 dto 추가해야함 .
  /** gift 전체 조회 */
  async findAll(): Promise<ResGiftDto[]> {
    return this.prisma.gift.findMany();
  }

  async findByCategory(category: GiftCategory): Promise<ResGiftDto[]> {
    return this.prisma.gift.findMany({ where: { category } });
  }
}
