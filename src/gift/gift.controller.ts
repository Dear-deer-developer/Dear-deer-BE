import { ApiTags } from '@nestjs/swagger';
import { ApiGifts } from './gift.swagger';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { GiftCategory } from 'src/common/enums/gift-category.enum';
import { GiftService } from './gift.service';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';

/** 추후 관리자 토큰 가드 추가 예정 */
@ApiTags('gift')
@Controller('gifts')
export class GiftController {
  constructor(private readonly giftService: GiftService) {}

  // 나의 gifts 조회 (필요없는 값은 수정해서 성능 향상해야됨 10.03)
  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  @ApiGifts.findMine()
  async getMyGifts(@Req() req) {
    const userId = req.user.id;
    return this.giftService.findUserGifts(userId);
  }

  @Get()
  @ApiGifts.findAll()
  findAll() {
    return this.giftService.getAllGifts();
  }

  @Get('category/:category')
  @ApiGifts.findByCategory()
  findByCategory(@Param('category') category: GiftCategory) {
    return this.giftService.getGiftsByCategory(category);
  }
}
