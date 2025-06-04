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
import { SendLetterDto } from './dto/send-letter.dto';
import { SaveWritingDto } from './dto/save-writing.dto';
import { ApiTags } from '@nestjs/swagger';
import { ApiLetters } from './letter.swagger';
import { DeleteLettersDto } from './dto/delete.letter.dto';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';

@ApiTags('letters')
@Controller('letters')
export class LetterController {
  constructor(private readonly letterService: LetterService) {}

  /** 편지 전송 */
  @Post('send')
  @UseGuards(FirebaseAuthGuard)
  @ApiLetters.send()
  async sendLetter(@Body() sendLetterDto: SendLetterDto, @Req() req: any) {
    return this.letterService.sendLetter(sendLetterDto);
  }

  /** 임시 저장 */
  @Post('writing')
  @UseGuards(FirebaseAuthGuard)
  @ApiLetters.saveWriting()
  async saveWriting(@Body() saveWritingDto: SaveWritingDto) {
    return this.letterService.saveWriting(saveWritingDto);
  }

  /** 단일 편지 조회 */
  @Get(':letterId')
  @ApiLetters.findOne()
  async findLetter(@Param('letterId') letterId: number) {
    return this.letterService.findLetter(+letterId);
  }

  /** 자신의 전체 편지 조회*/
  @Get()
  @ApiLetters.findAll()
  @UseGuards(FirebaseAuthGuard)
  async findLetters(@Req() req: any) {
    const userId = req.user.id;
    return this.letterService.findLetters(userId);
  }

  /** 편지 삭제 */
  @Delete()
  @ApiLetters.delete()
  @UseGuards(FirebaseAuthGuard)
  async deleteLetters(@Body() dto: DeleteLettersDto, @Req() req: any) {
    const userId = req.user.id;
    return this.letterService.deleteLetters(dto.letterIds, userId);
  }
}
