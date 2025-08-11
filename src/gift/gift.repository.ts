import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GiftCategory } from 'src/common/enums/gift-category.enum';
import { ResGiftDto } from './dtos/res-gift.dto';
import { UpdateGiftDto } from './dtos/update-gift.dto';

@Injectable()
export class GiftRepository {
  constructor(private readonly prisma: PrismaService) {}

  // 반환 타입 dto 추가해야함 .
  /** gift 생성 */
  async create(data: {
    name: string;
    category: GiftCategory;
    imageUrl: string;
  }): Promise<ResGiftDto> {
    return this.prisma.gift.create({ data });
  }

  /** gift 전체 조회 */
  async findAll(): Promise<ResGiftDto[]> {
    return this.prisma.gift.findMany();
  }

  async findById(id: number): Promise<ResGiftDto> {
    return this.prisma.gift.findUnique({ where: { id } });
  }

  async findByCategory(category: GiftCategory): Promise<ResGiftDto[]> {
    return this.prisma.gift.findMany({ where: { category } });
  }

  async update(id: number, data: UpdateGiftDto): Promise<ResGiftDto> {
    return this.prisma.gift.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.gift.delete({ where: { id } });
  }
}
