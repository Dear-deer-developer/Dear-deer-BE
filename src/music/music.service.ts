import { Injectable, NotFoundException } from '@nestjs/common';
import { MusicRepository } from './music.repository';
import { CreateMusicDto } from './dtos/create-music.dto';
import { UpdateMusicDto } from './dtos/update-music.dto';

@Injectable()
export class MusicService {
  constructor(private readonly musicRepo: MusicRepository) {}

  async list() {
    return this.musicRepo.findMany({
      orderBy: { id: 'asc' },
      select: { id: true, title: true, artist: true, createdAt: true },
    });
  }

  async get(id: number) {
    const music = await this.musicRepo.findById(id);
    if (!music) throw new NotFoundException('Music not found');
    return music;
  }

  async create(dto: CreateMusicDto) {
    return this.musicRepo.create({
      title: dto.title,
      artist: dto.artist,
    });
  }

  async update(id: number, dto: UpdateMusicDto) {
    const exists = await this.musicRepo.findById(id);
    if (!exists) throw new NotFoundException('Music not found');
    return this.musicRepo.update(id, {
      ...(dto.title ? { title: dto.title } : {}),
      ...(dto.artist ? { artist: dto.artist } : {}),
    });
  }

  async remove(id: number) {
    const exists = await this.musicRepo.findById(id);
    if (!exists) throw new NotFoundException('Music not found');
    return this.musicRepo.delete(id);
  }
}
