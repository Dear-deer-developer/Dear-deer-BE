import { ApiProperty } from '@nestjs/swagger';

export class ResCheckNicknameDto {
  @ApiProperty({
    example: true,
    description: '닉네임 사용 가능 여부 (true: 사용 가능, false: 중복)',
    type: Boolean,
  })
  isAvailable: boolean;
}
