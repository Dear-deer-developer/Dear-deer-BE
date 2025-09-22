import { Module } from '@nestjs/common';
import { MusicService } from './music.service';
import { MusicRepository } from './music.repository';
import { MusicController } from './music.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [MusicController],
  providers: [MusicService, MusicRepository],
})
export class MusicModule {}
