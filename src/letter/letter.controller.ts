import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { LetterService } from './letter.service';
import { SendLetterDto } from './dto/send-letter.dto';
import { SaveWritingDto } from './dto/save-writing.dto';

@Controller('letters')
export class LetterController {
  constructor(private readonly letterService: LetterService) {}

  /** 편지 전송 */
  @Post('send')
  async sendLetter(@Body() sendLetterDto: SendLetterDto) {
    return this.letterService.sendLetter(sendLetterDto);
  }

  /** 임시 저장 */
  @Post('writing')
  async saveWriting(@Body() saveWritingDto: SaveWritingDto) {
    return this.letterService.saveWriting(saveWritingDto);
  }

  /** 단일 편지 조회 */
  @Get(':id')
  async findLetter(@Param('id') id: number) {
    return this.letterService.findLetter(+id);
  }

  /** 전체 편지 조회 */
  @Get(':id')
  async findLetters(@Param('id') id: number) {
    return this.letterService.findLetters(+id);
  }

  /** 편지 삭제 */
  @Delete(':id')
  async deleteLetter(@Param('id', ParseIntPipe) id: number) {
    return this.letterService.deleteLetter(id);
  }
}
