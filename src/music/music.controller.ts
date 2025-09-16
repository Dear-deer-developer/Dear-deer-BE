import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MusicService } from './music.service';
import { CreateMusicDto } from './dtos/create-music.dto';
import { UpdateMusicDto } from './dtos/update-music.dto';
import { ApiMusics } from './music.swagger';
// import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Controller('musics')
@ApiTags('musics')
// @UseGuards(FirebaseAuthGuard) // 여기는 admin 가드로 추후 변경 (09.16)
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Get()
  @ApiMusics.findAll()
  list() {
    return this.musicService.list();
  }

  @Get(':musicId')
  @ApiMusics.findOne()
  get(@Param('musicId', ParseIntPipe) musicId: number) {
    return this.musicService.get(musicId);
  }

  @Post()
  @ApiMusics.create()
  create(@Body() dto: CreateMusicDto) {
    return this.musicService.create(dto);
  }

  @Put(':musicId')
  @ApiMusics.update()
  update(
    @Param('musicId', ParseIntPipe) musicId: number,
    @Body() dto: UpdateMusicDto,
  ) {
    return this.musicService.update(musicId, dto);
  }

  // 삭제시 해당 음악을 참조 중인 alarm이 없는지 확인하기.
  @Delete(':musicId')
  @HttpCode(204)
  @ApiMusics.remove()
  remove(@Param('musicId', ParseIntPipe) musicId: number) {
    return this.musicService.remove(musicId);
  }
}
