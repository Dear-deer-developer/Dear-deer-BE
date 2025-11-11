import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  LetterStatus,
  LetterStatusValue,
} from 'src/common/enums/letter-status.enum';
import { ResSendLetterDto } from './dtos/res-send-letter.dto';
import { ResDraftLetterDto } from './dtos/res-draft-letter.dto';
import { ResReceivedLetterDto } from './dtos/res-received-letter.dto';
import { ResSentLetterDto } from './dtos/res-sent-letter.dto';
import { ResDraftLetterItemDto } from './dtos/res-draft-letter-item.dto';
import { SaveWritingDto } from './dtos/save-writing.dto';

const letterSelect = {
  id: true,
  content: true,
  imageUrl: true,
  paperId: true,
  status: true,
  sentAt: true,
  receiverId: true,
  sender: {
    select: { id: true, nickname: true },
  },
  receiver: {
    select: { id: true, nickname: true },
  },
};

// (2) Prisma가 이 select의 타입을 추론하도록 유틸리티 타입 생성
// (이 타입을 Promise의 반환 타입으로 사용합니다)
type LetterDetail = Prisma.LetterGetPayload<{
  select: typeof letterSelect;
}>;

@Injectable()
export class LetterRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** 편지 전송 */
  sendLetter(
    data: Prisma.LetterUncheckedCreateInput,
  ): Promise<ResSendLetterDto> {
    return this.prisma.letter.create({
      data,
      select: {
        id: true,
        paperId: true,
        senderId: true,
        receiverId: true,
        status: true,
        sentAt: true,
      },
    });
  }

  /** writing이 이미 있으면 업데이트, 없으면 생성 */
  upsertWriting(
    senderId: number,
    dto: SaveWritingDto,
  ): Promise<ResDraftLetterDto> {
    const dataToSave = {
      content: dto.content,
      imageUrl: dto.imageUrl ?? null,
      receiverId: dto.receiverId ?? null,
      paperId: dto.paperId,
      status: LetterStatusValue.WRITING,
    };

    const commonSelect = {
      id: true,
      senderId: true,
      receiverId: true,
      content: true,
      imageUrl: true,
      paperId: true,
      status: true,
      sentAt: true,
    };

    // 기존에 있던 편지라면 업데이트
    if (dto.letterId) {
      return this.prisma.letter.update({
        where: { id: dto.letterId, senderId: senderId },
        data: dataToSave,
        select: commonSelect,
      });
    }
    // 기존에 없던 편지라면 생성
    return this.prisma.letter.create({
      data: {
        senderId,
        ...dataToSave,
      },
      select: commonSelect,
    });
  }

  /** 내 사서함 조회 */
  async findReceivedLetters(userId: number): Promise<ResReceivedLetterDto[]> {
    return this.prisma.letter.findMany({
      where: {
        receiverId: userId,
      },
      orderBy: {
        sentAt: 'desc',
      },
      select: {
        id: true,
        status: true,
        sentAt: true,
        sender: {
          select: { id: true, nickname: true },
        },
      },
    });
  }

  /** 보낸 편지함 조회 */
  async findSentLetters(userId: number): Promise<ResSentLetterDto[]> {
    return this.prisma.letter.findMany({
      where: {
        senderId: userId,
        status: { in: [LetterStatusValue.SENT, LetterStatusValue.RECEIVED] },
      },
      orderBy: [{ status: 'desc' }, { sentAt: 'desc' }],
      select: {
        id: true,
        status: true,
        sentAt: true,
        receiver: {
          // 받는 사람이 null이 아닐 경우
          select: { id: true, nickname: true },
        },
      },
    });
  }

  /** 임시 보관함 조회 */
  async findDraftLetters(userId: number): Promise<ResDraftLetterItemDto[]> {
    return this.prisma.letter.findMany({
      where: {
        senderId: userId,
        status: LetterStatusValue.WRITING,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        receiver: {
          select: {
            nickname: true,
          },
        },
        content: true,
        status: true,
        updatedAt: true,
      },
    });
  }

  // 유저 소유의 유효한 편지 목록 조회 (현재 삭제시 사용)
  async findUserLettersByIds(letterIds: number[], userId: number) {
    return this.prisma.letter.findMany({
      where: {
        id: { in: letterIds },
        senderId: userId,
      },
      select: { id: true, imageUrl: true, status: true, paperId: true },
    });
  }

  // 실제 삭제
  async deleteLetters(letterIds: number[]) {
    return this.prisma.letter.deleteMany({
      where: {
        id: { in: letterIds },
      },
    });
  }

  /** letterId로 단일 편지 조회 */
  async findLetterById(letterId: number): Promise<LetterDetail | null> {
    return await this.prisma.letter.findUnique({
      where: { id: letterId },
      select: letterSelect, // 공통 select 적용
    });
  }

  /** 편지 상태 변경 */
  async updateLetterStatus(
    letterId: number,
    status: LetterStatus,
  ): Promise<LetterDetail> {
    return this.prisma.letter.update({
      where: { id: letterId },
      data: { status },
      select: letterSelect, // 공통 select 적용
    });
  }
}
