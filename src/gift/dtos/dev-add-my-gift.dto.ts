import { IsInt } from 'class-validator';

export class CreateGiftDto {
  @IsInt()
  giftId: number;
}
