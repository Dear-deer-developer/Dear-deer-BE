import { IsNotEmpty, IsString } from 'class-validator';

export class TokenRefreshDto {
  @IsString()
  @IsNotEmpty({ message: '갱신 토큰은 필수입니다.' })
  refreshToken: string;
}
