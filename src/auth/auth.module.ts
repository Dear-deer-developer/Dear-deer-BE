import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { HttpModule } from '@nestjs/axios';
import { FirebaseAuthGuard } from './firebase-auth.guard';

@Module({
  imports: [UsersModule, HttpModule],
  providers: [AuthService, FirebaseAuthGuard],
  controllers: [AuthController],
  exports: [FirebaseAuthGuard, UsersModule],
})
export class AuthModule {}
