import { Controller, Patch, Body, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { UpdateNicknameDto } from './dtos/update-nickname.dto';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('nickname')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({ summary: '사용자 닉네임 수정(최초 1회만 가능)' })
  @ApiBody({ type: UpdateNicknameDto })
  @ApiResponse({
    status: 200,
    description: '닉네임 수정 완료',
  })
  async updateNickname(@Req() req: any, @Body() body: UpdateNicknameDto) {
    const providerId = req.user.providerId;
    return this.usersService.updateNicknameAndZipCode(
      providerId,
      body.nickname,
    );
  }
}
