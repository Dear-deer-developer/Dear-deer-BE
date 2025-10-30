import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * 12/25 산타 편지 응답에 포함될 편지 정보 DTO
 * (내부 사용)
 */
class ResEnterCalendarLetterDto {
  @ApiProperty({ example: 123, description: '생성된 편지 ID' })
  id: number;

  @ApiProperty({ example: 1, description: '보낸 사람(산타) ID' })
  senderId: number;
}

/**
 * 캘린더 진입(POST /calendar/enter) 응답 DTO
 */
export class ResEnterCalendarDto {
  @ApiProperty({
    example: 'GIFT',
    enum: ['GIFT', 'LETTER'],
    description: '오늘 보상 타입 (GIFT: 일반 아이템, LETTER: 산타 편지)',
  })
  rewardType: 'GIFT' | 'LETTER';

  @ApiProperty({
    example: true,
    description:
      '보상을 오늘 새로 지급받았는지 여부 (true: 방금 받음, false: 이미 받음)',
  })
  received: boolean;

  @ApiPropertyOptional({
    example: '2025-11-06',
    description: '지급된 보상의 날짜 (YYYY-MM-DD). received: true일 때만 존재.',
  })
  localDate?: string;

  @ApiPropertyOptional({
    example: 5,
    description:
      '지급된 선물의 ID. rewardType: GIFT, received: true일 때만 존재.',
  })
  giftId?: number;

  @ApiPropertyOptional({
    example: 'carpet_1',
    description: '지급된 선물의 이름. received: true일 때만 존재.',
  })
  giftName?: string;

  @ApiPropertyOptional({
    description:
      '지급된 산타 편지 정보. rewardType: LETTER, received: true일 때만 존재.',
    type: () => ResEnterCalendarLetterDto,
  })
  @Type(() => ResEnterCalendarLetterDto)
  letter?: ResEnterCalendarLetterDto;
}
