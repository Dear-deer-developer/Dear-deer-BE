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
    description: '닉네임 설정 완료',
    schema: {
      example: {
        id: 1,
        providerId: '123456789',
        nickname: '디어디어12',
        zipCode: 10001,
        createdAt: '2025-07-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: '닉네임은 최초 1회만 설정할 수 있습니다.',
    schema: {
      example: {
        statusCode: 409,
        message: '닉네임은 최초 1회만 설정할 수 있습니다.',
        error: 'Conflict',
      },
    },
  })
  async updateNickname(
    @Req() req: any,
    @Body() { nickname }: UpdateNicknameDto,
  ) {
    const userId = req.user.id;
    return this.usersService.updateNickname(userId, nickname);
  }
}
