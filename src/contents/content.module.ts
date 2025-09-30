import { Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { ContentRepository } from './content.repository';

@Module({
  controllers: [ContentController],
  providers: [ContentService, ContentRepository],
  exports: [ContentService, ContentRepository],
})
export class ContentModule {}
