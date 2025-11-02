import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { LetterService } from './letter.service';
import { SendLetterDto } from './dtos/send-letter.dto';
import { SaveWritingDto } from './dtos/save-writing.dto';
import { ApiTags } from '@nestjs/swagger';
import { ApiLetters } from './letter.swagger';
import { DeleteLettersDto } from './dtos/delete-letter.dto';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { GetUserId } from 'src/auth/decorators/get-user-id.decorator';
import { ResSendLetterDto } from './dtos/res-send-letter.dto';
import { ResDraftLetterDto } from './dtos/res-draft-letter.dto';
import { ResReceivedLetterDto } from './dtos/res-received-letter.dto';
import { ResDraftLetterItemDto } from './dtos/res-draft-letter-item.dto';
import { ResSentLetterDto } from './dtos/res-sent-letter.dto';
import { ResLetterDto } from './dtos/res-letter.dto';
import { ResDeleteLettersDto } from './dtos/res-delete-letter.dto';

@Controller('letters')
@UseGuards(AuthGuard('accessToken'))
@ApiTags('letters')
export class LetterController {
  constructor(private readonly letterService: LetterService) {}

  /** 편지 전송 */
  @Post()
  @ApiLetters.send()
  async sendLetter(
    @Body() sendLetterDto: SendLetterDto,
    @GetUserId() userId: number,
  ): Promise<ResSendLetterDto> {
    return await this.letterService.sendLetter(userId, sendLetterDto);
  }

  /** 임시 저장 */
  @Post('draft')
  @ApiLetters.saveDraft()
  async saveWriting(
    @Body() saveWritingDto: SaveWritingDto,
    @GetUserId() userId: number,
  ): Promise<ResDraftLetterDto> {
    return await this.letterService.saveWriting(userId, saveWritingDto);
  }

  /** 내 사서함 조회 */
  @Get('received')
  @ApiLetters.findReceived()
  async findReceivedLetters(
    @GetUserId() userId: number,
  ): Promise<ResReceivedLetterDto[]> {
    return await this.letterService.findReceivedLetters(userId);
  }

  /** 보낸 편지함 조회 */
  @Get('sent')
  @ApiLetters.findSent()
  async findSentLetters(
    @GetUserId() userId: number,
  ): Promise<ResSentLetterDto[]> {
    return await this.letterService.findSentLetters(userId);
  }

  /** 임시 보관함 조회 */
  @Get('draft')
  @ApiLetters.findDraft()
  async findDraftLetters(
    @GetUserId() userId: number,
  ): Promise<ResDraftLetterItemDto[]> {
    return await this.letterService.findDraftLetters(userId);
  }

  /** 단일 편지 조회 */
  @Get(':letterId')
  @ApiLetters.findOne()
  async findLetter(
    @Param('letterId', ParseIntPipe) letterId: number,
    @GetUserId() userId: number,
  ): Promise<ResLetterDto> {
    return await this.letterService.findLetter(letterId, userId);
  }

  /** 편지 삭제 */
  @Delete()
  @HttpCode(200)
  @ApiLetters.delete()
  async deleteLetters(
    @Query() dto: DeleteLettersDto,
    @GetUserId() userId: number,
  ): Promise<ResDeleteLettersDto> {
    return await this.letterService.deleteLetters(dto.letterIds, userId);
  }
}
