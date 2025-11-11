import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiContent } from './content.swagger';
import { ContentsQueryDto } from './dtos/contents-query.dto';
import { ContentListItemDto } from './dtos/content-list-item.dto';
import { ContentDetailDto } from './dtos/content-detail.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('contents')
@ApiBearerAuth('accessToken')
@UseGuards(AuthGuard('accessToken'))
@Controller('contents')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  /** 콘텐츠 리스트 조회 (카테고리별 필터링) */
  @Get()
  @ApiContent.findAll()
  async findAll(
    @Query() query: ContentsQueryDto,
  ): Promise<ContentListItemDto[]> {
    return this.contentService.findAllPublishedContents(query);
  }

  /** 특정 콘텐츠 상세 조회 */
  @Get(':contentId')
  @ApiContent.findOne()
  async findOne(
    @Param('contentId', ParseIntPipe) contentId: number,
    @GetUser('userId') userId: number,
  ): Promise<ContentDetailDto> {
    return this.contentService.findOnePublishedContent(contentId, userId);
  }
}
