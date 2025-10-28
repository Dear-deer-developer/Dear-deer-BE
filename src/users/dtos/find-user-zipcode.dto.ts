import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class FindUserZipcodeDto {
  @ApiProperty({ example: 22340, description: '검색할 5자리 우편번호' })
  @Type(() => Number) // 👈 Query param (string)을 숫자로 변환
  @IsInt({ message: '우편번호는 정수여야 합니다.' })
  @Min(10000, { message: '유효하지 않은 5자리 우편번호입니다.' })
  @Max(99999, { message: '유효하지 않은 5자리 우편번호입니다.' })
  zipCode: number;
}
