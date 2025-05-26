import { Module } from '@nestjs/common';
import { LetterController } from './letter.controller';
import { LetterService } from './letter.service';
import { LetterRepository } from './letter.repository';

@Module({
  controllers: [LetterController],
  providers: [LetterService, LetterRepository],
  exports: [LetterService],
})
export class LetterModule {}
