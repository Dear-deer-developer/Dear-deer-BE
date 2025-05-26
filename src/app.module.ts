import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { FirebaseAdminModule } from './firebase/firebase-admin.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { LetterModule } from './letter/letter.module';

@Module({
  imports: [
    FirebaseAdminModule,
    UsersModule,
    AuthModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
    LetterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
