import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByProviderId(provider_id: string) {
    return this.prisma.user.findUnique({
      where: { provider_id },
    });
  }

  async create(data: {
    provider_id: string;
    nickname: string;
    zip_code: number;
  }) {
    return this.prisma.user.create({
      data,
    });
  }
}
