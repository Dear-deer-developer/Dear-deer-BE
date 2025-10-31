import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ContentImageUploadDto {
  @ApiProperty({
    example: 'image1.jpg',
    description: '업로드할 원본 파일 이름(확장자 포함)',
  })
  @IsString()
  @IsNotEmpty()
  originalFileName: string;

  @ApiProperty({
    example: 'image/jpeg',
    description: '이미지 MIME 타입(예: image/jpeg, image/png',
  })
  @IsString()
  @IsNotEmpty()
  contentType: string;
}
