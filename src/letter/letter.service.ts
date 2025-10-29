import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LetterRepository } from './letter.repository';
import { SendLetterDto } from './dtos/send-letter.dto';
import { SaveWritingDto } from './dtos/save-writing.dto';
import { S3Service } from 'src/s3/s3.service';
import { LetterStatusValue } from 'src/common/enums/letter-status.enum';
import { ImagePresignService } from 'src/image/image-presign.service';
import { ResSendLetterDto } from './dtos/res-send-letter.dto';
import { ResDraftLetterDto } from './dtos/res-draft-letter.dto';
import { ResReceivedLetterDto } from './dtos/res-received-letter.dto';
import { ResSentLetterDto } from './dtos/res-sent-letter.dto';
import { ResDraftLetterItemDto } from './dtos/res-draft-letter-item.dto';
import { ResLetterDto } from './dtos/res-letter.dto';

@Injectable()
export class LetterService {
  constructor(
    private readonly letterRepository: LetterRepository,
    private readonly s3Service: S3Service,
    private readonly imagePresignService: ImagePresignService,
  ) {}

  /** 실제 전송, status: sent, sentAt 기록 */
  async sendLetter(
    userId: number,
    sendLetterDto: SendLetterDto,
  ): Promise<ResSendLetterDto> {
    return this.letterRepository.sendLetter({
      ...sendLetterDto,
      senderId: userId,
      status: LetterStatusValue.SENT,
      sentAt: new Date(),
    });
  }

  /** 임시 저장, status: writing */
  async saveWriting(
    senderId: number,
    saveWritingDto: SaveWritingDto,
  ): Promise<ResDraftLetterDto> {
    return this.letterRepository.upsertWriting(senderId, saveWritingDto);
  }

  /** 단일 조회 */
  async findLetter(letterId: number, userId: number): Promise<ResLetterDto> {
    // 일단 편지 데이터를 조회
    const letter = await this.letterRepository.findLetterById(letterId);
    if (!letter) throw new NotFoundException('Letter not found');

    let letterData = letter;

    // 내가 받은 편지이고, 상태가 SENT 라면 -> RECEIVED로 변경
    if (
      letterData.receiverId === userId &&
      letterData.status === LetterStatusValue.SENT
    ) {
      letterData = await this.letterRepository.updateLetterStatus(
        letterId,
        LetterStatusValue.RECEIVED,
      );
    }

    let presignedUrl: string | null = null;

    // url 이 있는 경우에만 presignedUrl 생성
    if (letterData.imageUrl) {
      presignedUrl = await this.s3Service.generateGetObjectPresignedUrl(
        letterData.imageUrl,
      );
    }

    const { imageUrl, receiverId, ...restOfLetterData } = letterData;

    return { ...restOfLetterData, presignedUrl };
  }

  /** 내 사서함 확인 */
  async findReceivedLetters(userId: number): Promise<ResReceivedLetterDto[]> {
    return this.letterRepository.findReceivedLetters(userId);
  }

  /** 보낸 편지함 확인 */
  async findSentLetters(userId: number): Promise<ResSentLetterDto[]> {
    const letters = await this.letterRepository.findSentLetters(userId);

    // 편지함 확인시 이미지까지 불러오는게 아니라 이미지는 단일조회시만 호출.
    // 이 코드는 잘 못 만들었던 코드같은데 일단 남겨두고 나중에 삭제할게요 (10.27)
    // const lettersWithPresign = await this.imagePresignService.attachSignedUrls(
    //   letters,
    //   {
    //     keySelector: (r) => r.imageUrl,
    //     outProp: 'signedImageUrl', // 기본값이라 생략 가능
    //     ttlSec: 300, // 나중에 상수값으로 변경하겠습니다 (09.10)
    //   },
    // );

    return letters;
  }

  /** 임시 보관함 확인 */
  async findDraftLetters(userId: number): Promise<ResDraftLetterItemDto[]> {
    return this.letterRepository.findDraftLetters(userId);
  }

  /** 삭제 */
  async deleteLetters(letterIds: number[], userId: number) {
    // 1. 유효한 편지 조회 (user 소유)
    const existingLetters = await this.letterRepository.findUserLettersByIds(
      letterIds,
      userId,
    );

    // 1-1. 사용자가 요청한 ID 중, 소유권이 확인된 편지가 하나도 없다면
    if (existingLetters.length === 0) {
      throw new NotFoundException('삭제할 편지를 찾을 수 없습니다.');
    }

    // 2. [핵심] 소유권이 확인된 편지 중 "WRITING" 상태인 편지만 필터링
    const deletableLetters = existingLetters.filter(
      (letter) => letter.status === LetterStatusValue.WRITING,
    );

    // 2-1. 삭제 가능한 편지의 ID 목록 추출
    const deletableIds = deletableLetters.map((letter) => letter.id);

    // 2-2. 소유권은 있으나 WRITING 상태가 아니거나,
    //      애초에 소유권이 없는 ID 목록
    const invalidIds = letterIds.filter((id) => !deletableIds.includes(id));

    // 2-3. 실제로 삭제할 편지가 하나도 없다면 (ex: SENT 상태의 편지만 요청 시)
    if (deletableIds.length === 0) {
      throw new BadRequestException(
        '삭제 가능한 편지가 없습니다. (WRITING 상태의 편지만 삭제 가능)',
      );
    }

    // 3-1. s3 이미지 keys 추출 (삭제할 편지들만)
    const s3Keys = deletableLetters
      .map((letter) => letter.imageUrl)
      .filter((key) => !!key); // map을 돌린 후 null 값은 제거

    if (s3Keys.length > 0) {
      await this.s3Service.deleteObjects(s3Keys);
    }

    // 2-2. DB에서 실제 삭제
    const result = await this.letterRepository.deleteLetters(deletableIds);

    return {
      deletedCount: result.count,
      requestedCount: letterIds.length,
      validIds: deletableIds, // 실제로 삭제된 ID 목록
      invalidIds: invalidIds, // 삭제 실패한 ID 목록
    };
  }
}
