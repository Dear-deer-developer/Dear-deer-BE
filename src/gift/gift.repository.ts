import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GiftCategory } from 'src/common/enums/gift-category.enum';
import { ResGiftDto } from './dtos/res-gift.dto';
import { EquipmentGiftDto } from './dtos/update-equipped.dto';
import { ResEquippedGiftDto } from './dtos/res-equipped-gift.dto';

@Injectable()
export class GiftRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 나의 gifts 조회
   */
  async findMyGifts(userId: number) {
    const myGifts = this.prisma.userGift.findMany({
      where: { userId },
      select: {
        gift: {
          select: { id: true, name: true, category: true },
        },
        obtainedAt: true,
      },
    });
    return myGifts;
  }

  /**
   * 현재 유저가 장착한 모든 아이템 조회
   */
  async findEquippedGifts(userId: number): Promise<ResEquippedGiftDto[]> {
    return this.prisma.userEquipSlot.findMany({
      where: { userId },
      select: {
        giftId: true,
        category: true,
        slot: true,
      },
    });
  }

  /**
   * 유저의 장착 상태를 통째로 덮어쓰기 (Transaction)
   */
  async updateEquippedGifts(
    userId: number,
    equipment: EquipmentGiftDto[],
  ): Promise<ResEquippedGiftDto[]> {
    // 트랜잭션 시작
    return this.prisma.$transaction(async (tx) => {
      // 1. 소유권 검증 (유저가 보유한 선물 목록)
      const ownedGifts = await tx.userGift.findMany({
        where: { userId },
        select: { giftId: true },
      });

      // 여기서 new Set을 하면 시간복잡도가 변경된다는데(성능 향상) -> 이건 추후 공부예정
      const ownedGiftIdSet = new Set(ownedGifts.map((g) => g.giftId));

      // 2. 요청된 아이템 중 소유하지 않은 아이템이 있는지 확인
      for (const item of equipment) {
        if (!ownedGiftIdSet.has(item.giftId)) {
          throw new BadRequestException(
            `보유하지 않은 선물(ID: ${item.giftId})을 장착할 수 없습니다.`,
          );
        }
      }

      // 3. 요청에 동일한 giftId가 중복되는지 확인 (안전장치)
      // @@unique([userId, giftId])가 막아주지만, 미리 체크
      const requestedGiftIds = equipment.map((e) => e.giftId);
      if (new Set(requestedGiftIds).size !== requestedGiftIds.length) {
        throw new BadRequestException(
          '하나의 선물을 여러 슬롯에 중복 장착할 수 없습니다.',
        );
      }

      // 4. 기존 장착 상태 모두 삭제
      await tx.userEquipSlot.deleteMany({
        where: { userId },
      });

      // 5. 새로운 장착 상태 삽입 (요청이 빈 배열이면 삽입 안 함)
      if (equipment.length > 0) {
        const dataToCreate = equipment.map((item) => ({
          userId,
          giftId: item.giftId,
          category: item.category,
          slot: item.slot,
        }));

        await tx.userEquipSlot.createMany({
          data: dataToCreate,
        });
      }

      // 6. 새로 저장된 최종 상태를 반환 (클라이언트의 'initialState' 업데이트용)
      return tx.userEquipSlot.findMany({
        where: { userId },
        select: {
          giftId: true,
          category: true,
          slot: true,
        },
      });
    });
  }

  ///////// 아래는 개발시 사용 /////////

  // 선물이 있는지 확인
  async findMyGiftByGiftId(giftId: number) {
    const myGift = await this.prisma.userGift.findFirst({
      where: { giftId },
      select: { gift: { select: { id: true, name: true, category: true } } },
    });
    return myGift;
  }

  // gift 전체 조회
  async findAll(): Promise<ResGiftDto[]> {
    return this.prisma.gift.findMany();
  }

  // 카테고리 별 조회
  async findByCategory(category: GiftCategory): Promise<ResGiftDto[]> {
    return this.prisma.gift.findMany({ where: { category } });
  }

  // 내가 가진 선물 생성
  async createMyGift(userId: number, giftId: number): Promise<any> {
    return this.prisma.userGift.create({
      data: {
        userId,
        giftId,
      },
    });
  }

  // 내가 가진 선물 삭제
  async deleteMyGift(userId: number, giftId: number): Promise<void> {
    await this.prisma.userGift.deleteMany({
      where: { userId, giftId },
    });
  }
}
