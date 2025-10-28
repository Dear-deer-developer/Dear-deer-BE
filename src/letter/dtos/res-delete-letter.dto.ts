import { ApiProperty } from '@nestjs/swagger';

/**
 * '편지 다중 삭제' 응답용 DTO
 */
export class ResDeleteLettersDto {
  @ApiProperty({ description: '실제로 삭제된 편지의 수', example: 1 })
  deletedCount: number;

  @ApiProperty({ description: '사용자가 삭제 요청한 편지의 수', example: 2 })
  requestedCount: number;

  @ApiProperty({
    description: '삭제에 성공한 편지 ID 목록',
    type: [Number],
    example: [10],
  })
  validIds: number[];

  @ApiProperty({
    description: '삭제에 실패한 (권한이 없거나 존재하지 않는) 편지 ID 목록',
    type: [Number],
    example: [99],
  })
  invalidIds: number[];
}
