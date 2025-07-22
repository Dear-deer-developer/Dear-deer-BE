import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum } from 'class-validator';
import {
  GiftCategory,
  GiftCategoryValue,
} from 'src/common/enums/gift-category.enum';

export class CreateGiftDto {
  @ApiProperty({
    example: '진저 쿠키',
    description: '선물의 이름',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: GiftCategoryValue.ORNAMENT,
    enum: GiftCategoryValue,
    description: '선물 카테고리',
  })
  @IsEnum(GiftCategoryValue)
  category: GiftCategory;

  @ApiProperty({
    example: 'https://s3.amazonaws.com/bucket/gifts/uuid.jpg',
    description: 'S3에 업로드된 이미지 URL',
  })
  @IsString()
  imageUrl: string;
}
