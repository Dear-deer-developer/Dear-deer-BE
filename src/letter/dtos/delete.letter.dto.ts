import { IsArray, ArrayNotEmpty, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class DeleteLettersDto {
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number) // (string → number)
  @IsInt({ each: true }) // 각 요소 정수 검증
  letterIds: number[];
}
