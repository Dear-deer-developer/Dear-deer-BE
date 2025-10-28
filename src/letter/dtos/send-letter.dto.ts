import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class SendLetterDto {
  @ApiPropertyOptional({
    example: 2,
    description: '받는 사람 ID (없을 수도 있음)',
  })
  @IsOptional()
  @IsInt()
  receiverId?: number;

  @ApiProperty({
    example: 1,
    description: '선택된 편지지 ID (필수)',
  })
  @IsInt({ message: '편지지 ID는 정수여야 합니다.' })
  @IsNotEmpty({ message: '편지지 ID는 필수 입력 항목입니다.' })
  paperId: number;

  @ApiProperty({ example: '안녕하세요!', description: '편지 내용' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  content: string;

  @ApiPropertyOptional({
    example: 'letters/test-image.png',
    description: '이미지 URL',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
