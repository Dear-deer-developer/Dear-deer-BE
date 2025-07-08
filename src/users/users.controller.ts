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
  @ApiOperation({ summary: '사용자 닉네임 설정(최초 1회만 가능)' })
  @ApiBody({ type: UpdateNicknameDto })
  @ApiResponse({
    status: 200,
    description: '닉네임 설정/수정 완료',
    schema: {
      example: {
        id: 1,
        providerId: '123456789',
        nickname: '디어디어',
        zipCode: 10001,
        createdAt: '2025-07-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '존재하지 않는 사용자입니다.',
    schema: {
      example: {
        statusCode: 404,
        message: '사용자를 찾을 수 없습니다.',
        error: 'Not Found',
      },
    },
  })
  async updateNickname(@Req() req: any, @Body() dto: UpdateNicknameDto) {
    console.log('닉네임 업데이트 요청 들어옴 :', dto.nickname);
    return this.usersService.updateNickname(req.user.id, dto.nickname);
  }
}
