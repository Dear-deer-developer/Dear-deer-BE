import { PartialType } from '@nestjs/mapped-types';
import { SendLetterDto } from './send-letter.dto';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class SaveWritingDto extends PartialType(SendLetterDto) {
  /** writing 업데이트용 optional id */
  @IsOptional() @IsInt() id?: number;

  @IsInt()
  senderId: number;

  @IsString()
  content: string;
}
