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
  async findLetter(id: number) {
    const letter = await this.letterRepository.findLetterById(id);
    if (!letter) throw new NotFoundException('Letter not found');
    return letter;
  }

  /** 전체 조회 */
  async findLetters(id: number) {
    const letters = await this.letterRepository.findLettersById(id);
    if (!letters) throw new NotFoundException('Letter not found');
    return letters;
  }

  /** 삭제 */
  async deleteLetter(id: number) {
    const letter = await this.letterRepository.findLetterById(id);
    if (!letter) {
      throw new NotFoundException(`Letter with ID ${id} not found`);
    }
    return this.letterRepository.deleteLetter(id);
  }
}
