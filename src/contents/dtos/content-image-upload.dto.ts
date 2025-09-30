import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ContentImageUploadDto {
  @ApiProperty({ example: 'image_1.jpg', description: '원래 파일 이름' })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({ example: 'image/jpeg', description: '파일 MIME 타입' })
  @IsString()
  @IsNotEmpty()
  contentType: string;
}
