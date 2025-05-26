import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';

export class SendLetterDto {
  @IsInt()
  senderId: number;

  @IsOptional()
  @IsInt()
  receiverId?: number;

  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  content: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
