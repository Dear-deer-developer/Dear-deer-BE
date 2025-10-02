import { ApiProperty } from '@nestjs/swagger';
import {
  GiftCategory,
  GiftCategoryValue,
} from 'src/common/enums/gift-category.enum';

export class ResGiftDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '진저 쿠키' })
  name: string;

  @ApiProperty({ enum: GiftCategoryValue, example: 'ORNAMENT' })
  category: GiftCategory;
}
