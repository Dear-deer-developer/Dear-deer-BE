import { Injectable, NotFoundException } from '@nestjs/common';
import { LetterRepository } from './letter.repository';
import { SendLetterDto } from './dto/send-letter.dto';
import { LetterStatus } from './enums/letter-status.enum';
import { SaveWritingDto } from './dto/save-writing.dto';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class LetterService {
  constructor(
    private readonly letterRepository: LetterRepository,
    private readonly s3Service: S3Service,
  ) {}

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
    let presignedUrl = null;

    const letter = await this.letterRepository.findLetterById(letterId);
    if (!letter) throw new NotFoundException('Letter not found');
    presignedUrl = await this.s3Service.generateGetObjectPresignedUrl(
      letter.imageUrl,
    );
    return { letter, presignedUrl };
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

    // 2-1. s3 이미지 keys 추출 및 삭제
    const s3Keys = existingLetters
      .map((letter) => letter.imageUrl)
      .filter((key) => !!key); // map을 돌린 후 null 값은 제거

    await this.s3Service.deleteObjects(s3Keys);

    // 2-2. DB에서 실제 삭제
    const result = await this.letterRepository.deleteLetters(validIds);

    return {
      deletedCount: result.count,
      requestedCount: letterIds.length,
      validIds,
      invalidIds: letterIds.filter((id) => !validIds.includes(id)),
    };
  }
}
