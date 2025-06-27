import { Injectable, NotFoundException } from '@nestjs/common';
import { LetterRepository } from './letter.repository';
import { SendLetterDto } from './dto/send-letter.dto';
import { LetterStatus } from './enums/letter-status.enum';
import { SaveWritingDto } from './dto/save-writing.dto';

@Injectable()
export class LetterService {
  constructor(private readonly letterRepository: LetterRepository) {}

  /** 실제 전송, status: sent, sentAt 기록 */
  async sendLetter(sendLetterDto: SendLetterDto) {
    return this.letterRepository.sendLetter({
      ...sendLetterDto,
      status: LetterStatus.SENT,
      sentAt: new Date(),
    });
  }

  /** 임시 저장, status: writing */
  async saveWriting(saveWritingDto: SaveWritingDto) {
    return this.letterRepository.upsertWriting(saveWritingDto);
  }

  /** 단일 조회 */
  async findLetter(letterId: number) {
    const letter = await this.letterRepository.findLetterById(letterId);
    if (!letter) throw new NotFoundException('Letter not found');
    return letter;
  }

  /** 전체 조회 */
  async findLetters(userId: number) {
    const letters = await this.letterRepository.findLettersById(userId);
    return letters;
  }

  /** 삭제 */
  async deleteLetters(letterIds: number[], userId: string) {
    // 1. 유효한 편지 조회 (user 소유)
    const existingLetters = await this.letterRepository.findUserLettersByIds(
      letterIds,
      userId,
    );
    const validIds = existingLetters.map((letter) => letter.id);

    if (validIds.length === 0) {
      throw new NotFoundException('삭제할 편지를 찾을 수 없습니다.');
    }

    // 2. 실제 삭제
    const result = await this.letterRepository.deleteLetters(validIds);

    return {
      deletedCount: result.count,
      requestedCount: letterIds.length,
      validIds,
      invalidIds: letterIds.filter((id) => !validIds.includes(id)),
    };
  }
}
