import { Module } from '@nestjs/common';
import { GiftController } from './gift.controller';
import { GiftService } from './gift.service';
import { GiftRepository } from './gift.repository';

@Module({
  controllers: [GiftController],
  providers: [GiftService, GiftRepository],
})
export class GiftModule {}
