import { ApiProperty } from '@nestjs/swagger';

export class ResMusicDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Jingle Bells (Instrumental)' })
  title: string;

  @ApiProperty({ example: 'Jingle Punks' })
  artist: string;

  @ApiProperty({ example: '2025-09-24T12:34:56.000Z' })
  createdAt: string;
}
