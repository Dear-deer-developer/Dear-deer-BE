import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { UsersService } from '../users/users.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly firebaseAdminService: FirebaseAdminService,
    private readonly usersService: UsersService,
    private readonly httpService: HttpService, //kakao API 호출용
    private readonly configService: ConfigService, // 환경변수 사용을 위한 ConfigService
  ) {}

  async authenticate(idToken: string) {
    try {
      const decoded = await this.firebaseAdminService.verifyToken(idToken);
      const providerId = decoded.uid;
      const nickname = decoded.name || '익명';
      const zipCode = 0;

      // Firebase에서 제공하는 uid를 사용하여 사용자 정보를 가져오기(이미 있는 사용자 찾기)
      let user = await this.usersService.findByProviderId(providerId);

      // 사용자가 없는 경우 새 사용자 생성
      if (!user) {
        user = await this.usersService.create({
          providerId: providerId,
          nickname,
          zipCode: zipCode,
        });
      }

      return user;
    } catch (err) {
      throw new UnauthorizedException('Invalid Firebase Token');
    }
  }

  // Kakao Access Token -> Firebase Custom Token 발급
  async kakaoLogin(accessToken: string): Promise<string> {
    try {
      const data = await this.getKakaoUserInfo(accessToken);

      const kakaoId = `kakao:${data.id}`;
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
          client_id: this.configService.get('KAKAO_REST_API_KEY'), // 카카오 REST API 키
          redirect_uri: this.configService.get('KAKAO_REDIRECT_URI'), // 등록한 URI와 반드시 같아야 함
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

  private async getKakaoUserInfo(accessToken: string) {
    console.log('accessToken', accessToken);

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
