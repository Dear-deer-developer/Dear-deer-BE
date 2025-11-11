import { Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { ContentRepository } from './content.repository';
import { S3Module } from 'src/s3/s3.module';
import { UsersModule } from 'src/users/users.module';
import { ContentAdminController } from './content.admin.controller';
import { ScrapModule } from 'src/scrap/scrap.module';

@Module({
  imports: [S3Module, UsersModule, ScrapModule],
  controllers: [ContentController, ContentAdminController],
  providers: [ContentService, ContentRepository],
  exports: [ContentService, ContentRepository],
})
export class ContentModule {}
