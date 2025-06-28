import { Module } from '@nestjs/common';
import { LetterController } from './letter.controller';
import { LetterService } from './letter.service';
import { LetterRepository } from './letter.repository';
import { FirebaseAdminModule } from 'src/firebase/firebase-admin.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [LetterController],
  providers: [LetterService, LetterRepository],
  exports: [LetterService],
})
export class LetterModule {}
