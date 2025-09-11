import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ContentService } from './content.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiContent } from './content.swagger';
import { ContentsQueryDto } from './dtos/contents-query.dto';

@ApiTags('contents')
@Controller('contents')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  /** 콘텐츠 리스트 조회 (카테고리별 필터링) */
  @Get()
  @ApiContent.findAll()
  async findAll(@Query() query: ContentsQueryDto) {
    return this.contentService.findAllPublishedContents(query);
  }

  /** 특정 콘텐츠 상세 조회 */
  @Get(':contentId')
  @ApiContent.findOne()
  async findOne(@Param('contentId', ParseIntPipe) contentId: number) {
    return this.contentService.findOnePublishedContent(contentId);
  }
}
