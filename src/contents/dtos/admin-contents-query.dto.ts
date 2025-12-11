import { IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContentStatus } from '@prisma/client';

export class AdminContentsQueryDto {
  @ApiProperty({
    description: '필터링할 콘텐츠 상태',
    required: false,
    enum: ContentStatus,
  })
  @IsOptional()
  @IsIn(Object.values(ContentStatus))
  status?: ContentStatus;
}
