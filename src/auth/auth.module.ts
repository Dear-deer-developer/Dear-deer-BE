import { Module } from '@nestjs/common';
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
import { PassportModule } from '@nestjs/passport';
import { JWTAdminGuard } from './guard/jwt-admin.guard';

@Module({
  imports: [
    // PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: jwtConfig, // 옵션을 생성할 함수
    }),
    UsersModule,
    HttpModule,
    FirebaseAdminModule,
  ],
  providers: [
    AuthService,
    FirebaseAuthGuard,
    AuthRepository,
    AccessTokenGuard,
    JWTAdminGuard,
  ],
  controllers: [AuthController],
  exports: [FirebaseAuthGuard, UsersModule, AccessTokenGuard, JWTAdminGuard],
})
export class AuthModule {}
