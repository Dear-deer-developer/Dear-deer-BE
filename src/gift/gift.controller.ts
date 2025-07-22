import { ApiTags } from '@nestjs/swagger';
import { ApiGifts } from './gift.swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { GiftCategory } from 'src/common/enums/gift-category.enum';
import { UpdateGiftDto } from './dtos/update-gift.dto';
import { GiftService } from './gift.service';
import { CreateGiftDto } from './dtos/create-gift.dto';

/** 추후 관리자 토큰 가드 추가 예정 */
@ApiTags('Gift')
@Controller('gifts')
export class GiftController {
  constructor(private readonly giftService: GiftService) {}

  @Post()
  @ApiGifts.create()
  create(@Body() dto: CreateGiftDto) {
    return this.giftService.createGift(dto);
  }

  @Get()
  @ApiGifts.findAll()
  findAll() {
    return this.giftService.getAllGifts();
  }

  @Get(':giftId')
  @ApiGifts.findOne()
  findOne(@Param('giftId', ParseIntPipe) giftId: number) {
    return this.giftService.getGiftById(giftId);
  }

  @Get('category/:category')
  @ApiGifts.findByCategory()
  findByCategory(@Param('category') category: GiftCategory) {
    return this.giftService.getGiftsByCategory(category);
  }

  @Put(':giftId')
  @ApiGifts.update()
  update(
    @Param('giftId', ParseIntPipe) giftId: number,
    @Body() dto: UpdateGiftDto,
  ) {
    return this.giftService.updateGift(giftId, dto);
  }

  @Delete(':giftId')
  @HttpCode(204)
  @ApiGifts.remove()
  async remove(@Param('giftId', ParseIntPipe) giftId: number) {
    await this.giftService.deleteGift(giftId);
  }
}
