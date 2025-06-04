import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FirebaseAdminService } from './firebase-admin.service';
import * as admin from 'firebase-admin';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const encodedKey = configService.get<string>('FIREBASE_ADMIN_SDK');
        const serviceAccount = JSON.parse(
          Buffer.from(encodedKey, 'base64').toString('utf8'),
        );

        return admin.apps.length
          ? admin.app()
          : admin.initializeApp({
              credential: admin.credential.cert(serviceAccount),
            });
      },
    },
    FirebaseAdminService,
  ],
  exports: [FirebaseAdminService],
})
export class FirebaseAdminModule {}
