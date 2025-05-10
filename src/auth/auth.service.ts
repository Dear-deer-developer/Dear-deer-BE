import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { UsersService } from '../users/users.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly firebaseAdmin: FirebaseAdminService,
    private readonly usersService: UsersService,
    private readonly httpService: HttpService, //kakao API 호출용
  ) {}

  async authenticate(idToken: string) {
    try {
      const decoded = await this.firebaseAdmin.verifyToken(idToken);
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
      const { data } = await lastValueFrom(
        this.httpService.get('https://kapi.kakao.com/v2/user/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );

      const kakaoId = 'kakao:${data.id}';
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

      const firebaseToken = await this.firebaseAdmin.createCustomToken(kakaoId);
      return firebaseToken;
    } catch (err) {
      throw new UnauthorizedException('Invalid Kakao Access Token');
    }
  }
}
