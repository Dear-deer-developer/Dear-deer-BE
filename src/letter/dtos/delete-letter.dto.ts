import { IsArray, ArrayNotEmpty, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteLettersDto {
  @ApiProperty({
    description: '삭제할 편지 ID의 배열 (Query: ?letterIds=1&letterIds=2)',
    type: [Number],
    example: [1, 2, 4],
  })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number) // (string → number)
  @IsInt({ each: true }) // 각 요소 정수 검증
  letterIds: number[];
}
