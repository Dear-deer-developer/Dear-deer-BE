import { Module } from '@nestjs/common';
import { AlarmController } from './alarm.controller';
import { AlarmService } from './alarm.service';
import { AlarmRepository } from './alarm.repository';
import { FirebaseAdminModule } from 'src/firebase/firebase-admin.module';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [UsersModule, FirebaseAdminModule, AuthModule],
  providers: [AlarmService, AlarmRepository],
  controllers: [AlarmController],
  exports: [],
})
export class AlarmModule {}
