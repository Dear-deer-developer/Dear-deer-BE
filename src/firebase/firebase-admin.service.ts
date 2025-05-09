import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseAdminService {
  constructor(private readonly configService: ConfigService) {
    const encodedKey = this.configService.get<string>('FIREBASE_ADMIN_SDK');

    const serviceAccount = JSON.parse(
      Buffer.from(encodedKey, 'base64').toString('utf8'),
    );

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  }

  async verifyToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    return await admin.auth().verifyIdToken(idToken);
  }

  async createCustomToken(uid: string): Promise<string> {
    return await admin.auth().createCustomToken(uid);
  }
}
