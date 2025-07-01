import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { UsersService } from '../users/users.service';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { RegisterUserDto } from './dto/register-user.dto';
import { RegisterUserResponseDto } from './dto/res-register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly firebaseAdminService: FirebaseAdminService,
    private readonly usersService: UsersService,
    private readonly httpService: HttpService, //kakao API 호출용
    private readonly configService: ConfigService, // 환경변수 사용을 위한 ConfigService
  ) {}

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

  async register(data: RegisterUserDto): Promise<RegisterUserResponseDto> {
    const { providerId, nickname } = data;

    if (!providerId || !nickname) {
      throw new BadRequestException(
        'providerId와 nickname을 모두 입력해주세요.',
      );
    }

    const user = await this.usersService.findByProviderId(providerId);
    if (!user) {
      throw new NotFoundException('카카오 로그인을 먼저 진행해주세요.');
    }

    if (user.nickname && user.nickname !== '익명') {
      throw new ConflictException('이미 회원가입이 완료된 사용자입니다.');
    }

    const updatedUser = await this.usersService.updateNicknameAndZipCode(
      providerId,
      nickname,
    );

    return new RegisterUserResponseDto(updatedUser);
  }
}
