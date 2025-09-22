import { Injectable } from '@nestjs/common';
import { Music, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MusicRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(params?: Prisma.MusicFindManyArgs): Promise<Music[]> {
    return this.prisma.music.findMany(params);
  }

  findById(id: number): Promise<Music | null> {
    return this.prisma.music.findUnique({ where: { id } });
  }

  create(data: Prisma.MusicCreateInput): Promise<Music> {
    return this.prisma.music.create({ data });
  }

  update(id: number, data: Prisma.MusicUpdateInput): Promise<Music> {
    return this.prisma.music.update({ where: { id }, data });
  }

  delete(id: number): Promise<Music> {
    return this.prisma.music.delete({ where: { id } });
  }
}
