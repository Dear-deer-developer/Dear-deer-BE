import { Module } from '@nestjs/common';
import { ScrapController } from './scrap.controller';
import { ScrapService } from './scrap.service';
import { ScrapRepository } from './scrap.repository';
import { ContentRepository } from 'src/contents/content.repository';

@Module({
  controllers: [ScrapController],
  providers: [ScrapService, ScrapRepository, ContentRepository], // ContentRepository 추가
  exports: [ScrapRepository],
})
export class ScrapModule {}
