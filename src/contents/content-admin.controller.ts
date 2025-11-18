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
  HttpCode,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetUserId } from 'src/auth/decorators/get-user-id.decorator';
import { CreateContentDto } from './dtos/create-content.dto';
import { UpdateContentDto } from './dtos/update-content.dto';
import { AdminContentsQueryDto } from './dtos/admin-contents-query.dto';
import { ApiContent } from './content.swagger';

@ApiTags('contents (Admin)')
@ApiBearerAuth('accessToken')
@UseGuards(AuthGuard('jwtAdmin')) //전체적용!
@Controller('admin/contents')
export class ContentAdminController {
  constructor(private readonly contentService: ContentService) {}

  /** (관리자) 콘텐츠 목록 조회 */
  @Get()
  @ApiContent.findAllForAdmin()
  async findAllForAdmin(@Query() query: AdminContentsQueryDto) {
    return this.contentService.findAllForAdmin(query);
  }

  /** (관리자) 콘텐츠 상세 조회 */
  @Get(':contentId')
  @ApiContent.findOneForAdmin()
  async findOneForAdmin(@Param('contentId', ParseIntPipe) contentId: number) {
    return this.contentService.findOneForAdmin(contentId);
  }

  /** (관리자) 콘텐츠 등록 */
  @Post()
  @ApiContent.create()
  async createContent(
    @GetUserId('userId') authorId: number,
    @Body() dto: CreateContentDto,
  ) {
    return this.contentService.createContentByAdmin(authorId, dto);
  }

  /** (관리자) 콘텐츠 수정 */
  @Put(':contentId')
  @ApiContent.update()
  async updateContent(
    @Param('contentId', ParseIntPipe) contentId: number,
    @Body() dto: UpdateContentDto,
    @GetUserId('userId') authorId: number,
  ) {
    return this.contentService.updateContentByAdmin(contentId, authorId, dto);
  }

  /** (관리자) 콘텐츠 삭제 */
  @Delete(':contentId')
  @HttpCode(204)
  @ApiContent.delete()
  async deleteContent(
    @Param('contentId', ParseIntPipe) contentId: number,
    @GetUserId('userId') authorId: number,
  ) {
    await this.contentService.deleteContentByAdmin(contentId, authorId);
  }
}
