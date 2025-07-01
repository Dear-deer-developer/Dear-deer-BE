import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProviderId(providerId: string) {
    return this.prisma.user.findUnique({
      where: { providerId },
    });
  }

  async createUser(data: {
    providerId: string;
    nickname: string;
    zipCode: number;
  }) {
    return this.prisma.user.create({ data });
  }

  async updateByProviderId(
    providerId: string,
    data: Partial<{ nickname: string; zipCode: number }>,
  ) {
    return this.prisma.user.update({
      where: { providerId },
      data,
    });
  }
}
