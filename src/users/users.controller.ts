import { Controller, Patch, Body, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { UpdateNicknameDto } from './dtos/update-nickname.dto';
import { ApiTags } from '@nestjs/swagger';
import { SwaggerUpdateNickname } from './users.swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('nickname')
  @UseGuards(FirebaseAuthGuard)
  @SwaggerUpdateNickname()
  async updateNickname(@Req() req: any, @Body() dto: UpdateNicknameDto) {
    return this.usersService.updateNickname(req.user.id, dto.nickname);
  }
}
