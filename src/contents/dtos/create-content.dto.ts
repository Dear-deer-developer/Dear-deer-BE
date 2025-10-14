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
} from 'class-validator';
import { Type } from 'class-transformer';
import { ContentImageUploadDto } from './content-image-upload.dto';

export class CreateContentDto {
  @ApiProperty({
    example: 1,
    description: '콘텐츠가 속할 서브 카테고리 ID',
  })
  @IsInt()
  subCategoryId: number;

  @ApiProperty({ example: '새로운 콘텐츠 제목', description: '콘텐츠 제목' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  title: string;

  @ApiProperty({
    example: '여기에 콘텐츠 본문 내용을 작성합니다.',
    description: '콘텐츠 본문',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    type: [ContentImageUploadDto],
    description: '업로드할 이미지 파일 정보 (1장 이상, 10장 이하)',
  })
  @IsArray()
  @ArrayMinSize(1, { message: '이미지는 최소 1장 이상 업로드해야 합니다.' })
  @ArrayMaxSize(10, {
    message: '이미지는 최대 10장까지만 업로드 가능합니다.',
  })
  @ValidateNested({ each: true })
  @Type(() => ContentImageUploadDto)
  images: ContentImageUploadDto[];
}
