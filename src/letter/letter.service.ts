import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LetterRepository } from './letter.repository';
import { SendLetterDto } from './dtos/send-letter.dto';
import { SaveWritingDto } from './dtos/save-writing.dto';
import { S3Service } from 'src/s3/s3.service';
import { LetterStatusValue } from 'src/common/enums/letter-status.enum';
import { ResSendLetterDto } from './dtos/res-send-letter.dto';
import { ResDraftLetterDto } from './dtos/res-draft-letter.dto';
import { ResReceivedLetterDto } from './dtos/res-received-letter.dto';
import { ResSentLetterDto } from './dtos/res-sent-letter.dto';
import { ResDraftLetterItemDto } from './dtos/res-draft-letter-item.dto';
import { ResLetterDto } from './dtos/res-letter.dto';
import { SANTA_USER_ID } from './santa-user-id.provider';
import { nowKST } from 'src/common/functions/time.helper';
import { ReportRepository } from 'src/report/report.repository';

@Injectable()
export class LetterService {
  constructor(
    private readonly letterRepository: LetterRepository,
    private readonly s3Service: S3Service,
    private readonly reportRepository: ReportRepository,
    @Inject(SANTA_USER_ID) private readonly santaUserId: number,
  ) {
    console.log(`LetterService initialized with Santa ID: ${this.santaUserId}`);
  }

  /** 실제 전송, status: sent, sentAt 기록 */
  async sendLetter(
    senderId: number,
    sendLetterDto: SendLetterDto,
  ): Promise<ResSendLetterDto> {
    // 1. 산타에게 편지 보내기 차단
    if (sendLetterDto.receiverId === this.santaUserId) {
      throw new BadRequestException('산타클로스에게 편지를 보낼 수 없습니다.');
    }

    // 2. 차단 관계 확인 (보내는 사람 <-> 받는 사람)
    // ReportsRepository에 이 메서드를 추가해야 합니다 (아래 설명 참조)
    const isBlocked = await this.reportRepository.checkBlockStatus(
      senderId,
      sendLetterDto.receiverId,
    );

    if (isBlocked) {
      throw new ForbiddenException(
        '차단 관계에 있는 사용자에게는 편지를 보낼 수 없습니다.',
      );
    }

    return this.letterRepository.sendLetter({
      ...sendLetterDto,
      senderId,
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
    // 신고기능 구현을 위해 임시 주석 처리 (12.03)
    // const nowKst = nowKST();

    // const currentMonth = nowKst.getUTCMonth() + 1; // 0부터 시작하므로 +1
    // const currentDay = nowKst.getUTCDate();

    // // 2. 12월 25일 이전인지 체크
    // // (12월이 아니거나, 12월이어도 25일 전이라면)
    // if (currentMonth !== 12 || currentDay < 25) {
    //   throw new ForbiddenException(
    //     '아직 개봉할 수 없습니다! 12월 25일에 열어볼 수 있어요',
    //   );
    // }

    // 일단 편지 데이터를 조회
    const letter = await this.letterRepository.findLetterByIdAndUser(
      letterId,
      userId,
    );
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

  /** 내 사서함 (받은 편지)확인 */
  async findReceivedLetters(userId: number): Promise<ResReceivedLetterDto[]> {
    return this.letterRepository.findReceivedLetters(userId);
  }

  /** 보낸 편지함 확인 */
  async findSentLetters(userId: number): Promise<ResSentLetterDto[]> {
    const letters = await this.letterRepository.findSentLetters(userId);

    return letters;
  }

  /** 임시 보관함 확인 */
  async findDraftLetters(userId: number): Promise<ResDraftLetterItemDto[]> {
    return this.letterRepository.findDraftLetters(userId);
  }

  /** 삭제 */
  async deleteLetters(letterIds: number[], userId: number) {
    // 1. 유효한 편지 조회 (user 소유 & WRITING 상태)
    const deletableLetters = await this.letterRepository.findUserLettersByIds(
      letterIds,
      userId,
    );

    // 1-1. 삭제 가능한 편지의 ID 목록 추출
    const deletableIds = deletableLetters.map((letter) => letter.id);

    // 1-2. 소유권은 있으나 WRITING 상태가 아니거나,
    //      애초에 소유권이 없는 ID 목록
    const invalidIds = letterIds.filter((id) => !deletableIds.includes(id));

    // 2. 사용자가 요청한 편지 ID 중, 소유권이 확인된 편지가 하나도 없다면
    if (deletableIds.length === 0) {
      throw new NotFoundException('삭제 가능한 편지가 없습니다.');
    }

    // 3. s3 이미지 keys 추출 및 삭제 (삭제할 편지들만)
    const s3Keys = deletableLetters
      .map((letter) => letter.imageUrl)
      .filter((key) => !!key); // map을 돌린 후 null 값은 제거

    if (s3Keys.length > 0) {
      await this.s3Service.deleteObjects(s3Keys);
    }

    // 4. DB에서 삭제
    const result = await this.letterRepository.deleteLetters(deletableIds);

    return {
      deletedCount: result.count,
      requestedCount: letterIds.length,
      validIds: deletableIds, // 실제로 삭제된 ID 목록
      invalidIds: invalidIds, // 삭제 실패한 ID 목록
    };
  }
}
