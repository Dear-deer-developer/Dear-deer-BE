import { Controller, Patch, Body, Req, UseGuards, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { UpdateNicknameDto } from './dtos/update-nickname.dto';
import { ApiTags } from '@nestjs/swagger';
import { SwaggerUpdateNickname } from './users.swagger';
import { SwaggerGetUser } from './users.swagger';
import { GetUserId } from 'src/auth/decorators/get-user-id.decorator';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard('accessToken'))
  @SwaggerGetUser()
  async getUser(@GetUserId() userId: number) {
    return this.usersService.getUserInfoByUserId(userId);
  }

  // 소셜 로그인 개인정보 조회용 api 일단 주석처리 (10.17)
  // @Get('me')
  // @UseGuards(FirebaseAuthGuard)
  // @SwaggerGetUser()
  // async getUser(@Req() req: any) {
  //   const uid = req.user.uid;
  //   return this.usersService.getUserInfoByProviderId(uid);
  // }

  @Patch('nickname')
  @UseGuards(FirebaseAuthGuard)
  @SwaggerUpdateNickname()
  async updateNickname(@Req() req: any, @Body() dto: UpdateNicknameDto) {
    return this.usersService.updateNickname(req.user.id, dto.nickname);
  }
}
