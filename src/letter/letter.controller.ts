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
import { ApiTags } from '@nestjs/swagger';
import { ApiLetters } from './letter.swagger';

@ApiTags('letters')
@Controller('letters')
export class LetterController {
  constructor(private readonly letterService: LetterService) {}

  /** 편지 전송 */
  @Post('send')
  @ApiLetters.send()
  async sendLetter(@Body() sendLetterDto: SendLetterDto) {
    return this.letterService.sendLetter(sendLetterDto);
  }

  /** 임시 저장 */
  @Post('writing')
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

  /** 전체 편지 조회는 이후 수정 (토큰에서 uid 값을 가져와서 조회 할 예정)
    @Get()
    async findLetters(@Param('letterId') letterId: number) {
      return this.letterService.findLetters(+letterId);
    }
  */

  /** 편지 삭제 */
  @Delete(':letterId')
  @ApiLetters.remove()
  async deleteLetter(@Param('letterId', ParseIntPipe) letterId: number) {
    return this.letterService.deleteLetter(letterId);
  }
}
