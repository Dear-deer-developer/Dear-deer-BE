import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ScrapService } from './scrap.service';
import { GetUserId } from 'src/auth/decorators/get-user-id.decorator';
import { ApiScrap } from './scrap.swagger';

@ApiTags('scraps')
@ApiBearerAuth('accessToken')
@UseGuards(AuthGuard('accessToken'))
@Controller()
export class ScrapController {
  constructor(private readonly scrapService: ScrapService) {}

  /** 스크랩 생성 (좋아요) */
  @Post('contents/:contentId/scrap')
  @HttpCode(201)
  @ApiScrap.createScrap()
  async createScrap(
    @GetUserId('userId') userId: number,
    @Param('contentId', ParseIntPipe) contentId: number,
  ) {
    await this.scrapService.createScrap(userId, contentId);
    return { message: '스크랩되었습니다.' };
  }

  /** 스크랩 삭제 (좋아요 취소) */
  @Delete('contents/:contentId/scrap')
  @HttpCode(204)
  @ApiScrap.deleteScrap()
  async deleteScrap(
    @GetUserId('userId') userId: number,
    @Param('contentId', ParseIntPipe) contentId: number,
  ) {
    await this.scrapService.deleteScrap(userId, contentId);
  }

  /** 내 스크랩 목록 조회 */
  @Get('scraps/me')
  @ApiScrap.findMyScraps()
  async getMyScraps(@GetUserId('userId') userId: number) {
    return this.scrapService.findMyScraps(userId);
  }
}
