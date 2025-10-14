import { Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { ContentRepository } from './content.repository';
import { S3Module } from 'src/s3/s3.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [S3Module, UsersModule],
  controllers: [ContentController],
  providers: [ContentService, ContentRepository],
  exports: [ContentService, ContentRepository],
})
export class ContentModule {}
