import { PartialType } from '@nestjs/mapped-types';
import { SendLetterDto } from './send-letter.dto';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SaveWritingDto extends PartialType(SendLetterDto) {
  @ApiPropertyOptional({
    example: 42,
    description: '기존 편지 수정 시 사용하는 편지 ID (없으면 새로 생성)',
  })
  @IsOptional()
  @IsInt()
  letterId?: number;

  @ApiPropertyOptional({
    example: 2,
    description: '받는 사람 ID (없을 수도 있음)',
  })
  @IsOptional()
  @IsInt()
  receiverId?: number;

  @ApiProperty({
    example: '이건 저장 중인 편지 내용',
    description: '편지 본문 내용 ',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    example: 'letters/test-image.png',
    description: '이미지 URL',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
