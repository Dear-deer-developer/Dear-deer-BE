import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ContentService } from './content.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiContent } from './content.swagger';

@ApiTags('contents')
@Controller('contents')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  /** 전체 콘텐츠 리스트 조회 */
  @Get()
  @ApiContent.findAll()
  async findAll() {
    return this.contentService.findAllPublishedContents();
  }

  /** 특정 콘텐츠 상세 조회 */
  @Get(':contentId')
  @ApiContent.findOne()
  async findOne(@Param('contentId', ParseIntPipe) contentId: number) {
    return this.contentService.findOnePublishedContent(contentId);
  }
}
