import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { HttpModule } from '@nestjs/axios';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { FirebaseAdminModule } from '../firebase/firebase-admin.module';
import { AuthRepository } from './auth.repository';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from './jwt.config';
import { ConfigService } from '@nestjs/config';
import { AccessTokenGuard } from './guard/jwt.guard';
import { JWTAdminGuard } from './guard/jwt-admin.guard';
import { EmailService } from './Email/auth-email.service';
import { AuthNativeController } from './auth-naitve/auth-native.controller';
import { AuthNativeService } from './auth-naitve/auth-native.service';
import { AuthNativeRepository } from './auth-naitve/auth-native.repository';
import { CalendarRewardModule } from 'src/calendar-reward/calendar-reward.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: jwtConfig, // 옵션을 생성할 함수
    }),
    UsersModule,
    HttpModule,
    FirebaseAdminModule,
    forwardRef(() => CalendarRewardModule),
  ],
  providers: [
    AuthService,
    AuthNativeService,
    AuthRepository,
    AuthNativeRepository,
    EmailService,
    FirebaseAuthGuard,
    AccessTokenGuard,
    JWTAdminGuard,
  ],
  controllers: [AuthController, AuthNativeController],
  exports: [FirebaseAuthGuard, UsersModule, AccessTokenGuard, JWTAdminGuard],
})
export class AuthModule {}
