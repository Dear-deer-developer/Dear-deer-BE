import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BlockUserDto {
  @ApiProperty({ description: '차단할 대상 유저 ID', example: 6 })
  @IsNumber()
  @IsNotEmpty()
  targetUserId: number;
}
