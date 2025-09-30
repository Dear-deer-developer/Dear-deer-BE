import { Injectable, NotFoundException } from '@nestjs/common';
import { LetterRepository } from './letter.repository';
import { SendLetterDto } from './dtos/send-letter.dto';
import { SaveWritingDto } from './dtos/save-writing.dto';
import { S3Service } from 'src/s3/s3.service';
import { LetterStatusValue } from 'src/common/enums/letter-status.enum';
import { ImagePresignService } from 'src/image/image-presign.service';

@Injectable()
export class LetterService {
  constructor(
    private readonly letterRepository: LetterRepository,
    private readonly s3Service: S3Service,
    private readonly imagePresignService: ImagePresignService,
  ) {}

  /** 실제 전송, status: sent, sentAt 기록 */
  async sendLetter(sendLetterDto: SendLetterDto) {
    return this.letterRepository.sendLetter({
      ...sendLetterDto,
      status: LetterStatusValue.SENT,
      sentAt: new Date(),
    });
  }

  /** 임시 저장, status: writing */
  async saveWriting(saveWritingDto: SaveWritingDto) {
    return this.letterRepository.upsertWriting(saveWritingDto);
  }

  /** 단일 조회 */
  async findLetter(letterId: number, userId: number) {
    const letter = await this.letterRepository.findLetterById(letterId);
    if (!letter) throw new NotFoundException('Letter not found');

    let updatedLetter = letter;

    // 내가 받은 편지이고, 상태가 SENT 라면 -> RECEIVED로 변경
    if (
      letter.receiverId === userId &&
      letter.status === LetterStatusValue.SENT
    ) {
      updatedLetter = await this.letterRepository.updateLetterStatus(
        letterId,
        LetterStatusValue.RECEIVED,
      );
    }

    const presignedUrl = await this.s3Service.generateGetObjectPresignedUrl(
      letter.imageUrl,
    );

    return { updatedLetter, presignedUrl };
  }

  /** 보낸 편지 전체 조회 */
  async findLetters(userId: number) {
    // senderId가 자신인 편지들 조회
    const letters = await this.letterRepository.findLettersById(userId);
    const lettersWithPresign = await this.imagePresignService.attachSignedUrls(
      letters,
      {
        keySelector: (r) => r.imageUrl,
        outProp: 'signedImageUrl', // 기본값이라 생략 가능
        ttlSec: 300, // 나중에 상수값으로 변경하겠습니다 (09.10)
      },
    );

    return { lettersWithPresign };
  }

  /** 내 사서함 확인 */
  async findReceivedLetters(userId: number) {
    return this.letterRepository.findReceivedLetters(userId);
  }

  /** 보낸 편지함 확인 */
  async findSentLetters(userId: number) {
    const letters = await this.letterRepository.findSentLetters(userId);
    const lettersWithPresign = await this.imagePresignService.attachSignedUrls(
      letters,
      {
        keySelector: (r) => r.imageUrl,
        outProp: 'signedImageUrl', // 기본값이라 생략 가능
        ttlSec: 300, // 나중에 상수값으로 변경하겠습니다 (09.10)
      },
    );

    return { lettersWithPresign };
  }

  /** 임시 보관함 확인 */
  async findDraftLetters(userId: number) {
    return this.letterRepository.findDraftLetters(userId);
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
