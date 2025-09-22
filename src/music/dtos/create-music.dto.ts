import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMusicDto {
  @ApiProperty({ example: 'Jingle Bells (Instrumental)' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Jingle Punks' })
  @IsString()
  @IsNotEmpty()
  artist: string;
}
