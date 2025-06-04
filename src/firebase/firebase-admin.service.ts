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
    console.log('idToken : ', idToken);
    return await admin.auth().verifyIdToken(idToken);
  }

  async createCustomToken(uid: string): Promise<string> {
    return await admin.auth().createCustomToken(uid);
  }

  /** id 토큰 발급 함수
   * 개발시에만 사용 예정
   */
  async getIdTokenFromCustomToken(customToken: string) {
    const apiKey = this.configService.get('FIREBASE_API_KEY');
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`;
    const res = await axios.post(url, {
      token: customToken,
      returnSecureToken: true,
    });

    console.log('✅ Firebase ID Token:', res.data.idToken);

    return res.data.idToken;
  }
}
