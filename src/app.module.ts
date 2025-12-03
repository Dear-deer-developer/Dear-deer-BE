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
import { S3Module } from './s3/s3.module';
import { CalendarModule } from './schedule/schedule.module';
import { GiftModule } from './gift/gift.module';
import { AdminModule } from './admin/admin.module';
import { ContentModule } from './contents/content.module';
import { AlarmModule } from './alarm/alarm.module';
import { FcmTokenModule } from './fcm-token/fcm-token.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ImagePresignModule } from './image/image-presign.module';
import { MusicModule } from './music/music.module';
import { CalendarRewardModule } from './calendar-reward/calendar-reward.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    FirebaseAdminModule,
    UsersModule,
    AuthModule,
    PrismaModule,
    HttpModule,
    LetterModule,
    S3Module,
    CalendarModule,
    GiftModule,
    AdminModule,
    AlarmModule,
    FcmTokenModule,
    ImagePresignModule,
    MusicModule,
    CalendarRewardModule,
    ReportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
