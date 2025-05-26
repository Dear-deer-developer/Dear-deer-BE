import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';

export class SendLetterDto {
  @ApiProperty({ example: 17, description: '보내는 사람 ID' })
  @IsInt()
  senderId: number;

  @ApiPropertyOptional({
    example: 2,
    description: '받는 사람 ID (없을 수도 있음)',
  })
  @IsOptional()
  @IsInt()
  receiverId?: number;

  @ApiProperty({ example: '안녕하세요!', description: '편지 내용' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  content: string;

  @ApiPropertyOptional({
    example: 'https://image.url/image.jpg',
    description: '이미지 URL',
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
