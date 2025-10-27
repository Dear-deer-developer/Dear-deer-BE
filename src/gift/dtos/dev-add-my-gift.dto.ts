import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class CreateGiftDto {
  @ApiProperty({
    description: '선물의 고유 ID',
    example: 7,
  })
  @IsInt()
  giftId: number;
}
