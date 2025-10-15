import {
  Injectable,
  ForbiddenException, // 403 Forbidden 에러를 사용합니다.
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: number;
  isAdmin: boolean;
}

// jwtAdmin 가드를 사용하고 싶다면 @UseGuards(AuthGuard('jwtAdmin')) 을 붙여주면 됩니다.
@Injectable()
export class JWTAdminGuard extends PassportStrategy(Strategy, 'jwtAdmin') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    // 1. 토큰의 payload에 isAdmin 플래그가 true인지 확인
    if (!payload.isAdmin) {
      // 2. 관리자가 아니면 에러를 발생시켜 접근 거부
      throw new ForbiddenException('관리자 권한이 필요합니다.');
    }

    // 3. 관리자라면, 사용자 정보를 반환
    return { userId: payload.sub };
  }
}
