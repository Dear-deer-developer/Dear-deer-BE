import { Controller, Patch, Body, Req, UseGuards, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { UpdateNicknameDto } from './dtos/update-nickname.dto';
import { ApiTags } from '@nestjs/swagger';
import { SwaggerUpdateNickname } from './users.swagger';
import { SwaggerGetUser } from './users.swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  @SwaggerGetUser()
  async getUser(@Req() req: any) {
    const providerId = req.user.providerId;
    return this.usersService.getUserInfoByProviderId(providerId);
  }

  @Patch('nickname')
  @UseGuards(FirebaseAuthGuard)
  @SwaggerUpdateNickname()
  async updateNickname(@Req() req: any, @Body() dto: UpdateNicknameDto) {
    return this.usersService.updateNickname(req.user.id, dto.nickname);
  }
}
