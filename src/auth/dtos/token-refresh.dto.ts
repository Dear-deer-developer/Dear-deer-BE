import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TokenRefreshDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlzQWRtaW4iOmZhbHNlLCJpYXQiOjE3NjA0NDg0NDUsImV4cCI6MTc2MzA0MDQ0NX0.k_aBpkSGnUPtaGJhrrDcEdpAHcg0AHo3aU9j2rDS-dA',
    description: '비밀번호',
  })
  @IsString()
  @IsNotEmpty({ message: '갱신 토큰은 필수입니다.' })
  refreshToken: string;
}
