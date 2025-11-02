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
  Req,
  UseGuards,
} from '@nestjs/common';
import { GiftCategory } from 'src/common/enums/gift-category.enum';
import { GiftService } from './gift.service';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { GetUserId } from 'src/auth/decorators/get-user-id.decorator';
import { UpdateEquippedDto } from './dtos/update-equipped.dto';
import { CreateGiftDto } from './dtos/dev-add-my-gift.dto';
import { ResEquippedGiftDto } from './dtos/res-equipped-gift.dto';
import { ResGiftDto } from './dtos/res-gift.dto';

/** 추후 관리자 토큰 가드 추가 예정 */
@ApiTags('gift')
@Controller('gifts')
@UseGuards(AuthGuard('accessToken'))
export class GiftController {
  constructor(private readonly giftService: GiftService) {}

  // 나의 gifts 조회 (필요없는 값은 수정해서 성능 향상해야됨 10.03)
  @Get('me')
  @ApiGifts.findMine()
  async getMyGifts(@GetUserId() userId: number) {
    return this.giftService.findUserGifts(userId);
  }

  // 장착된 선물들 조회
  @Get('equipments')
  @HttpCode(200)
  @ApiGifts.getEquipped()
  async getEquippedGifts(
    @GetUserId() userId: number,
  ): Promise<ResEquippedGiftDto[]> {
    return this.giftService.getEquippedGifts(userId);
  }

  // 최종 장착 상태로 업데이트
  @Put('equipments')
  @HttpCode(200)
  @ApiGifts.updateEquipped()
  async updateEquippedGifts(
    @GetUserId() userId: number,
    @Body() dto: UpdateEquippedDto,
  ): Promise<ResEquippedGiftDto[]> {
    // 성공 시 클라이언트가 상태를 동기화할 수 있도록 업데이트된 목록 반환
    return this.giftService.updateEquippedGifts(userId, dto);
  }

  ///////// 아래는 개발시 사용 /////////
  // 전체 선물 조회
  @Get()
  @UseGuards(AuthGuard('jwtAdmin'))
  @ApiGifts.findAll()
  findAll(): Promise<ResGiftDto[]> {
    return this.giftService.getAllGifts();
  }

  // 카테고리별 선물 조회
  @Get(':category')
  @UseGuards(AuthGuard('jwtAdmin'))
  @ApiGifts.findByCategory()
  findByCategory(
    @Param('category') category: GiftCategory,
  ): Promise<ResGiftDto[]> {
    return this.giftService.getGiftsByCategory(category);
  }

  // 내가 가진 선물 추가
  @Post('me')
  @UseGuards(AuthGuard('jwtAdmin'))
  @HttpCode(201)
  @ApiGifts.addMyGift()
  async createGift(
    @GetUserId() userId: number,
    @Body() dto: CreateGiftDto,
  ): Promise<any> {
    return this.giftService.createMyGift(userId, dto.giftId);
  }

  // 내가 가진 선물 삭제
  @Delete('me/:giftId')
  @UseGuards(AuthGuard('jwtAdmin'))
  @HttpCode(204)
  @ApiGifts.deleteMyGift()
  async deleteGift(
    @Param('giftId', ParseIntPipe) giftId: number,
    @GetUserId() userId: number,
  ): Promise<void> {
    await this.giftService.deleteMyGift(userId, giftId);
  }
}
