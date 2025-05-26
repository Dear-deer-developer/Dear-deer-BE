import { PartialType } from '@nestjs/mapped-types';
import { SendLetterDto } from './send-letter.dto';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SaveWritingDto extends PartialType(SendLetterDto) {
  @ApiPropertyOptional({
    example: 42,
    description: '기존 편지 수정 시 사용하는 편지 ID (없으면 새로 생성)',
  })
  @IsOptional()
  @IsInt()
  letterId?: number;

  @ApiProperty({
    example: 1,
    description: '보내는 사람 ID',
  })
  @IsInt()
  senderId: number;

  @ApiProperty({
    example: '이건 저장 중인 편지 내용',
    description: '편지 본문 내용 ',
  })
  @IsString()
  content: string;
}
