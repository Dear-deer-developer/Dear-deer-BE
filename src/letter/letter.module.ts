import { Module } from '@nestjs/common';
import { LetterController } from './letter.controller';
import { LetterService } from './letter.service';
import { LetterRepository } from './letter.repository';
import { FirebaseAdminModule } from 'src/firebase/firebase-admin.module';
import { UsersModule } from 'src/users/users.module';
import { S3Module } from 'src/s3/s3.module';

@Module({
  imports: [UsersModule, S3Module],
  controllers: [LetterController],
  providers: [LetterService, LetterRepository],
  exports: [LetterService],
})
export class LetterModule {}
