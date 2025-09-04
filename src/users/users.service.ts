import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findByProviderId(providerId: string) {
    return this.usersRepository.findByProviderId(providerId);
  }

  async create(data: {
    providerId: string;
    nickname: string;
    zipCode: number;
  }) {
    return this.usersRepository.createUser(data);
  }

  async updateNickname(userId: number, nickname: string) {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const zipCode = 10000 + userId;

    return this.usersRepository.updateNickname(userId, nickname, zipCode);
  }
  async getUserInfoByProviderId(providerId: string) {
    const user = await this.usersRepository.findByProviderId(providerId);

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return user;
  }
}
