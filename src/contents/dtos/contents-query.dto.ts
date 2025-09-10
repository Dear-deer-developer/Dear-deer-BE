import { IsOptional, IsNumberString} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ContentsQueryDto {
    @ApiProperty({
        description: '메인 카테고리 ID',
        required: false,
    }),
    @IsOptional()
    @IsNumberString()
    mainCategoryId?: string;

    @ApiProperty({
        description: '서브 카테고리 ID',
        required: false,
    })
    @IsOptional()
    @IsNumberString()
    subCategoryId?: string;
}