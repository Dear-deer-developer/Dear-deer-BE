import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { LetterService } from './letter.service';
import { SendLetterDto } from './dtos/send-letter.dto';
import { SaveWritingDto } from './dtos/save-writing.dto';
import { ApiTags } from '@nestjs/swagger';
import { ApiLetters } from './letter.swagger';
import { DeleteLettersDto } from './dtos/delete-letter.dto';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';

@Controller('letters')
@ApiTags('letters')
export class LetterController {
  constructor(private readonly letterService: LetterService) {}

  /** 편지 전송 */
  @Post()
  @UseGuards(FirebaseAuthGuard)
  @ApiLetters.send()
  async sendLetter(@Body() sendLetterDto: SendLetterDto, @Req() req: any) {
    return this.letterService.sendLetter(sendLetterDto);
  }

  /** 임시 저장 */
  @Post('draft')
  @UseGuards(FirebaseAuthGuard)
  @ApiLetters.saveDraft()
  async saveWriting(@Body() saveWritingDto: SaveWritingDto) {
    return this.letterService.saveWriting(saveWritingDto);
  }

  /** 자신의 전체 편지 조회*/
  @Get()
  @UseGuards(FirebaseAuthGuard)
  @ApiLetters.findAll()
  async findLetters(@Req() req: any) {
    const userId = req.user.id;

    return this.letterService.findLetters(userId);
  }

  /** 내 사서함 확인 */
  @Get('received')
  @UseGuards(FirebaseAuthGuard)
  @ApiLetters.findReceived()
  async findReceivedLetters(@Req() req: any) {
    const userId = req.user.id;

    return this.letterService.findReceivedLetters(userId);
  }

  /** 보낸 편지함 확인 */
  @Get('sent')
  @UseGuards(FirebaseAuthGuard)
  @ApiLetters.findSent()
  async findSentLetters(@Req() req: any) {
    const userId = req.user.id;

    return this.letterService.findSentLetters(userId);
  }

  /** 임시 보관함 확인 */
  @Get('draft')
  @UseGuards(FirebaseAuthGuard)
  @ApiLetters.findDraft()
  async findDraftLetters(@Req() req: any) {
    const userId = req.user.id;

    return this.letterService.findDraftLetters(userId);
  }

  /** 단일 편지 조회 */
  @Get(':letterId')
  @UseGuards(FirebaseAuthGuard)
  @ApiLetters.findOne()
  async findLetter(@Param('letterId') letterId: number, @Req() req: any) {
    const userId = req.user.id;

    return this.letterService.findLetter(+letterId, userId);
  }

  /** 편지 삭제 */
  @Delete()
  @UseGuards(FirebaseAuthGuard)
  @ApiLetters.delete()
  async deleteLetters(@Body() dto: DeleteLettersDto, @Req() req: any) {
    const userId = req.user.id;

    return this.letterService.deleteLetters(dto.letterIds, userId);
  }
}
