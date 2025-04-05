import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { FirebaseAdminModule } from './firebase/firebase-admin.module';

@Module({
  imports: [FirebaseAdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
