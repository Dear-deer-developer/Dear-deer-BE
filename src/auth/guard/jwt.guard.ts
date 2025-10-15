import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: number; // User.id (데이터베이스 기본 키)
}

@Injectable()
export class AccessTokenGuard extends PassportStrategy(
  Strategy,
  'accessToken',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      // 1. JWT를 요청 헤더의 Bearer 스키마에서 추출
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 2. JWT 시크릿 키 로드
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
      // 3. 토큰 만료 여부 검증 (Passport가 자동으로 처리)
      ignoreExpiration: false,
    });
  }

  // 토큰이 유효하면 이 메서드가 호출되어 Payload를 반환합니다.
  async validate(payload: JwtPayload) {
    return { userId: payload.sub };
  }
}
