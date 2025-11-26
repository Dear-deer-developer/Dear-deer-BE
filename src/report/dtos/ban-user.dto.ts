import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class BanUserDto {
  @ApiProperty({
    description: '밴 처리할 유저 ID',
    example: 6,
  })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    description: '관리자 밴 사유 코멘트',
    example: '지속적인 상업성 광고 게시로 인한 영구 정지',
  })
  @IsString()
  @IsNotEmpty()
  adminComment: string; // 관리자가 남길 코멘트
}
