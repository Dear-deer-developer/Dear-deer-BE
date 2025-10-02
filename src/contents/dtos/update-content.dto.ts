import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  Length,
  IsInt,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ContentImageUploadDto } from './content-image-upload.dto';

export class UpdateContentDto {
  @ApiProperty({
    example: 1,
    description: '콘텐츠가 속할 서브 카테고리 ID',
    required: false,
  })
  @IsOptional()
  @IsInt()
  subCategoryId?: number;

  @ApiProperty({
    example: '수정된 콘텐츠 제목',
    description: '콘텐츠 제목',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  title?: string;

  @ApiProperty({
    example: '수정된 콘텐츠 본문 내용을 작성합니다.',
    description: '콘텐츠 본문',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;

  @ApiProperty({
    type: [String],
    description:
      '**수정 후 최종적으로 유지할** 기존 이미지 S3 Key 목록 (예: "contents/1/uuid1.jpg").',
    example: ['contents/1/uuid-old-1.jpg', 'contents/1/uuid-old-2.png'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  currentImageKeys: string[] = []; // 수정 후 유지할 기존 이미지 S3 Key

  @ApiProperty({
    type: [ContentImageUploadDto],
    description: '새로 추가할 이미지 파일 정보 목록.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentImageUploadDto)
  @IsOptional()
  newImages: ContentImageUploadDto[] = []; // 새로 업로드할 이미지 파일 정보
}
