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
  ) {
    return this.letterService.sendLetter(userId, sendLetterDto);
  }

  /** 임시 저장 */
  @Post('draft')
  @ApiLetters.saveDraft()
  async saveWriting(
    @Body() saveWritingDto: SaveWritingDto,
    @GetUserId() userId: number,
  ) {
    return this.letterService.saveWriting(userId, saveWritingDto);
  }

  /** 내 사서함 조회 */
  @Get('received')
  @ApiLetters.findReceived()
  async findReceivedLetters(@GetUserId() userId: number) {
    return this.letterService.findReceivedLetters(userId);
  }

  /** 보낸 편지함 조회 */
  @Get('sent')
  @ApiLetters.findSent()
  async findSentLetters(@GetUserId() userId: number) {
    return this.letterService.findSentLetters(userId);
  }

  /** 임시 보관함 조회 */
  @Get('draft')
  @ApiLetters.findDraft()
  async findDraftLetters(@GetUserId() userId: number) {
    return this.letterService.findDraftLetters(userId);
  }

  /** 단일 편지 조회 */
  @Get(':letterId')
  @ApiLetters.findOne()
  async findLetter(
    @Param('letterId', ParseIntPipe) letterId: number,
    @GetUserId() userId: number,
  ) {
    return this.letterService.findLetter(letterId, userId);
  }

  /** 편지 삭제 */
  @Delete()
  @HttpCode(204)
  @ApiLetters.delete()
  async deleteLetters(
    @Body() dto: DeleteLettersDto,
    @GetUserId() userId: number,
  ) {
    this.letterService.deleteLetters(dto.letterIds, userId);
  }
}
