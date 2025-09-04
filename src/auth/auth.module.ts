import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { HttpModule } from '@nestjs/axios';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { FirebaseAdminModule } from '../firebase/firebase-admin.module';

@Module({
  imports: [UsersModule, HttpModule, FirebaseAdminModule],
  providers: [AuthService, FirebaseAuthGuard],
  controllers: [AuthController],
  exports: [FirebaseAuthGuard, UsersModule],
})
export class AuthModule {}
