import * as admin from 'firebase-admin';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class FirebaseAdminService {
  constructor(
    @Inject('FIREBASE_ADMIN') private readonly app: admin.app.App,
    private readonly configService: ConfigService,
  ) {}

  async verifyToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    return await admin.auth().verifyIdToken(idToken);
  }

  async createCustomToken(uid: string): Promise<string> {
    return await admin.auth().createCustomToken(uid);
  }

  /** id 토큰 발급 함수
   * 개발시에만 사용 예정
   */
  async getIdTokenFromCustomToken(customToken: string) {
    const apiKey = this.configService.get<string>('FIREBASE_API_KEY');
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`;
    const res = await axios.post(url, {
      token: customToken,
      returnSecureToken: true,
    });

    // console.log('Firebase ID Token:', res.data.idToken);

    return res.data.idToken;
  }

  /** fcm 발송 메서드 */
  async sendFcm(token: string, title: string, message: string) {
    const payload = {
      token,
      notification: {
        title,
        body: message,
      },
      data: {
        body: message,
      },
    };

    try {
      const response = await admin.messaging().send(payload);
      return { sent: true, response };
    } catch (error) {
      console.error('FCM 전송 실패:', error.code);
      return { sent: false, error: error.code };
    }
  }
}
