import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  Body,
  Req,
  HttpCode,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiContent } from './content.swagger';
import { ContentsQueryDto } from './dtos/contents-query.dto';
import { AuthGuard } from '@nestjs/passport';
import { CreateContentDto } from './dtos/create-content.dto';
import { UpdateContentDto } from './dtos/update-content.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { ContentListItemDto } from './dtos/content-list-item.dto';
import { ContentDetailDto } from './dtos/content-detail.dto';
import { Content } from '@prisma/client';

@ApiTags('contents')
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
  ): Promise<ContentDetailDto> {
    return this.contentService.findOnePublishedContent(contentId);
  }

  /** (관리자 전용) 콘텐츠 등록 */
  @Post()
  @ApiBearerAuth('accessToken')
  @UseGuards(AuthGuard('jwtAdmin'))
  @ApiContent.create()
  async createContent(
    @GetUser('userId') authorId: number,
    @Body() dto: CreateContentDto,
  ) {
    return this.contentService.createContent(authorId, dto);
  }

  /** (관리자 전용) 콘텐츠 수정 */
  @Put(':contentId')
  @ApiBearerAuth('accessToken')
  @UseGuards(AuthGuard('jwtAdmin'))
  @ApiContent.update()
  async updateContent(
    @Param('contentId', ParseIntPipe) contentId: number,
    @Body() dto: UpdateContentDto,
    @GetUser('userId') authorId: number,
  ) {
    return this.contentService.updateContent(contentId, authorId, dto);
  }

  /** (관리자 전용) 콘텐츠 삭제 */
  @Delete(':contentId')
  @HttpCode(204)
  @ApiBearerAuth('accessToken')
  @UseGuards(AuthGuard('jwtAdmin'))
  @ApiContent.delete()
  async deleteContent(
    @Param('contentId', ParseIntPipe) contentId: number,
    @GetUser('userId') authorId: number,
  ) {
    await this.contentService.deleteContent(contentId, authorId);
  }
}
