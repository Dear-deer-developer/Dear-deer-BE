import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByProviderId(provider_id: string) {
    return this.prisma.user.findUnique({
      where: { providerId: provider_id },
    });
  }

  async create(data: {
    providerId: string;
    nickname: string;
    zipCode: number;
  }) {
    return this.prisma.user.create({
      data,
    });
  }
}
