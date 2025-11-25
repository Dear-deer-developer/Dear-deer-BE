import { IsNotEmpty, IsString } from 'class-validator';

export class BanUserDto {
  @IsString()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  adminComment: string; // 관리자가 남길 코멘트
}
