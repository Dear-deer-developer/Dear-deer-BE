import { Module } from '@nestjs/common';
import { LetterController } from './letter.controller';
import { LetterService } from './letter.service';
import { LetterRepository } from './letter.repository';
import { UsersModule } from 'src/users/users.module';
import { S3Module } from 'src/s3/s3.module';
import { ImagePresignModule } from 'src/image/image-presign.module';
import { AuthModule } from 'src/auth/auth.module';
import { SantaUserIdProvider } from './santa-user-id.provider';

@Module({
  imports: [UsersModule, S3Module, ImagePresignModule, AuthModule],
  controllers: [LetterController],
  providers: [LetterService, LetterRepository, SantaUserIdProvider],
  exports: [LetterService],
})
export class LetterModule {}
