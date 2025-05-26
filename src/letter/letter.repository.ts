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
    id?: number;
    senderId: number;
    receiverId?: number | null;
    content: string;
    imageUrl?: string | null;
  }) {
    if (sendLetterDto.id) {
      return this.prisma.letter.update({
        where: { id: sendLetterDto.id },
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

  findLetterById(id: number) {
    return this.prisma.letter.findUnique({ where: { id } });
  }

  findLettersById(id: number) {
    return this.prisma.letter.findMany({ where: { id } });
  }

  deleteLetter(id: number) {
    return this.prisma.letter.delete({ where: { id } });
  }
}
