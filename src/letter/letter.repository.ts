import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Letter } from '@prisma/client';
import { LetterStatus } from './enums/letter-status.enum';

@Injectable()
export class LetterRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** 새 편지 전송 */
  sendLetter(data: Prisma.LetterUncheckedCreateInput): Promise<Letter> {
    return this.prisma.letter.create({ data });
  }

  /** writing이 이미 있으면 업데이트, 없으면 생성 */
  upsertWriting(sendLetterDto: {
    letterId?: number;
    senderId: number;
    receiverId?: number | null;
    content: string;
    imageUrl?: string | null;
  }) {
    if (sendLetterDto.letterId) {
      return this.prisma.letter.update({
        where: { id: sendLetterDto.letterId },
        data: {
          ...sendLetterDto,
          status: LetterStatus.WRITING,
        },
      });
    }
    return this.prisma.letter.create({
      data: {
        ...sendLetterDto,
        status: LetterStatus.WRITING,
      },
    });
  }

  findLetterById(letterId: number) {
    return this.prisma.letter.findUnique({ where: { id: letterId } });
  }

  findLettersById(userId: number) {
    return this.prisma.letter.findMany({ where: { senderId: userId } });
  }

  deleteLetter(letterIds: number[]) {
    return this.prisma.letter.deleteMany({
      where: {
        id: { in: letterIds },
      },
    });
  }

  // 유저 소유의 유효한 편지 목록 조회
  async findUserLettersByIds(letterIds: number[], userId: string) {
    return this.prisma.letter.findMany({
      where: {
        id: { in: letterIds },
        senderId: Number(userId), // 또는 senderId
      },
      select: { id: true, imageUrl: true },
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
}
