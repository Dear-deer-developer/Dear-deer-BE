import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const jwtConfig = (configService: ConfigService): JwtModuleOptions => ({
  // JWT 비밀 키를 환경 변수에서 안전하게 로드합니다.
  secret: configService.get<string>('JWT_ACCESS_SECRET'),
  signOptions: {
    // Access Token 만료 시간을 환경 변수에서 로드하고, 기본값(30분)을 설정합니다.
    expiresIn: configService.get<number>('JWT_ACCESS_TOKEN_EXPIRY_TIME'),
  },
});
