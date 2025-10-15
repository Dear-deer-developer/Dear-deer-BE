import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { UsersService } from '../users/users.service';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from './auth.repository';
import { TokenResponseDto } from './dtos/token-res.dto';
import { JwtPayload } from './interface/jwt.interface';
import { AuthRegisterDto } from './dtos/auth-register.dto';
import { AuthLoginDto } from './dtos/auth-login.dto';

type ReqUser = { id: number; uid: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly firebaseAdminService: FirebaseAdminService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService, // 환경변수 사용을 위한 ConfigService
  ) {}

  // JWT 쌍 생성
  private async getTokens(user: {
    id: number;
    isAdmin: boolean;
  }): Promise<TokenResponseDto> {
    const payload: JwtPayload = { sub: user.id, isAdmin: user.isAdmin };

    // 1. Access Token 생성
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: parseInt(
        this.configService.get<string>('ACCESS_TOKEN_EXPIRY_TIME'),
        10,
      ),
    } as JwtSignOptions);

    // 2. Refresh Token 생성
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: parseInt(
        this.configService.get<string>('REFRESH_TOKEN_EXPIRY_TIME'),
        10,
      ),
    } as JwtSignOptions);

    // 3. Refresh Token의 만료 시각 계산 및 DB 저장
    const expiryDate = new Date();
    expiryDate.setDate(
      expiryDate.getDate() +
        parseInt(
          this.configService.get<string>('REFRESH_TOKEN_EXPIRY_TIME_FOR_DB'),
          10,
        ),
    );

    await this.authRepository.saveRefreshToken(
      user.id,
      refreshToken,
      expiryDate,
    );

    return { accessToken, refreshToken };
  }

  // 회원가입
  async register(dto: AuthRegisterDto): Promise<TokenResponseDto> {
    // 1. 이메일, 닉네임 중복 확인
    const emailExists = await this.authRepository.findByEmail(dto.email);
    if (emailExists) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }
    const nicknameExists = await this.authRepository.findByNickname(
      dto.nickname,
    );
    if (nicknameExists) {
      throw new ConflictException('이미 사용 중인 닉네임입니다.');
    }

    // 2. 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. 사용자 생성 (NATIVE 타입으로)
    const newUser = await this.authRepository.createUser({
      ...dto,
      hashedPassword,
    });

    // 4. 토큰 발급 및 리프레시 토큰 저장
    return this.getTokens(newUser);
  }

  // 로그인
  async login(dto: AuthLoginDto): Promise<TokenResponseDto> {
    // 1. 이메일로 사용자 찾기
    const user = await this.authRepository.findByEmail(dto.email);

    // 사용자가 없거나 (NATIVE가 아닌 다른 타입일 수 있음), 비밀번호가 없으면 에러
    if (!user || user.loginType !== 'NATIVE' || !user.hashedPassword) {
      throw new UnauthorizedException(
        '유효하지 않은 이메일 또는 비밀번호입니다.',
      );
    }

    // 2. 비밀번호 비교
    const isPasswordMatch = await bcrypt.compare(
      dto.password,
      user.hashedPassword,
    );
    if (!isPasswordMatch) {
      throw new UnauthorizedException(
        '유효하지 않은 이메일 또는 비밀번호입니다.',
      );
    }

    // 3. 토큰 발급 및 리프레시 토큰 저장
    return this.getTokens(user);
  }

  // 리프레시 토큰 갱신
  async refreshTokens(refreshToken: string): Promise<TokenResponseDto> {
    let payload: JwtPayload;

    if (!refreshToken) {
      throw new NotFoundException('Refresh token not found in headers');
    }

    try {
      // 1. JWT 서명 검증 (토큰이 변조되지 않았는지)
      // verifyAsync의 ignoreExpiration: true로 설정하여 만료 여부는 DB에서 판단
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        ignoreExpiration: true,
      });
    } catch (error) {
      throw new UnauthorizedException(
        '유효하지 않거나 변조된 갱신 토큰입니다.',
      );
    }

    const userId = payload.sub;

    // 2. DB에서 토큰 및 만료 시간 확인
    const storedToken = await this.authRepository.findRefreshToken(
      userId,
      refreshToken,
    );

    if (!storedToken) {
      // DB에 없거나 만료된 토큰
      throw new UnauthorizedException(
        '갱신 토큰이 만료되었거나 이미 사용되었습니다.',
      );
    }

    // 3. 이전 리프레시 토큰 삭제
    await this.authRepository.deleteRefreshToken(userId);

    // 4. 새로운 토큰 쌍 발급 (재발급 시점에서 admin 여부 확인 가능)
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('사용자 정보를 찾을 수 없습니다.');
    }

    return this.getTokens(user);
  }

  // 로그아웃 로직 (리프레시 토큰 삭제)
  async logout(userId: number): Promise<void> {
    // DB에서 리프레시 토큰을 삭제하여 강제 로그아웃
    await this.authRepository.deleteRefreshToken(userId);
  }

  /////////// 아래는 소셜로그인 ///////////

  // Kakao Access Token -> Firebase Custom Token 발급
  async kakaoLogin(accessToken: string): Promise<string> {
    try {
      const data = await this.getKakaoUserInfo(accessToken);

      const kakaoId = `${data.id}`;
      const nickname = data.properties?.nickname || '익명';
      const zipCode = 0;

      let user = await this.usersService.findByProviderId(kakaoId);

      if (!user) {
        user = await this.usersService.create({
          providerId: kakaoId,
          nickname,
          zipCode: zipCode,
        });
      }

      const firebaseToken =
        await this.firebaseAdminService.createCustomToken(kakaoId);
      return firebaseToken;
    } catch (err) {
      console.error(
        '🔥 Kakao 사용자 정보 요청 실패:',
        err.response?.data || err.message,
      );

      throw new UnauthorizedException('Invalid Kakao Access Token');
    }
  }

  async getKakaoAccessToken(code: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://kauth.kakao.com/oauth/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.configService.get<string>('KAKAO_REST_API_KEY'), // 카카오 REST API 키
          redirect_uri: this.configService.get<string>('KAKAO_REDIRECT_URI'), // 등록한 URI와 반드시 같아야 함
          code,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return response.data.access_token;
    } catch (err) {
      console.error(
        '🔥 Kakao 토큰 발급 실패:',
        err.response?.data || err.message,
      );
      throw err;
    }
  }

  getWhoAmI(user: ReqUser) {
    const isAdmin = this.isAdminUid(user.uid);
    return { uid: user.uid, userId: user.id, isAdmin };
  }

  isAdminUid(uidRaw: string): boolean {
    const admins = this.getAdminUidList();
    const uid = this.normalizeUid(uidRaw);
    return !!uid && admins.includes(uid);
  }

  private getAdminUidList(): string[] {
    const raw = this.configService.get<string>('ADMINS') || '';
    return raw
      .split(',')
      .map((s) => this.normalizeUid(s))
      .filter(Boolean);
  }

  private normalizeUid(s?: string): string {
    if (!s) return '';
    return s
      .trim()
      .replace(/^['"]|['"]$/g, '')
      .replace(/^kakao:/, '');
  }

  private async getKakaoUserInfo(accessToken: string) {
    const response = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'User-Agent': 'axios',
        'Accept-Encoding': 'identity',
      },
    });

    return response.data;
  }
}
