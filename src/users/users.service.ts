import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async findByProviderId(providerId: string) {
    return this.userRepository.findByProviderId(providerId);
  }

  async create(data: {
    providerId: string;
    nickname: string;
    zipCode: number;
  }) {
    return this.userRepository.createUser(data);
  }

  async updateNickname(userId: number, nickname: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const zipCode = 10000 + userId;

    return this.userRepository.updateNickname(userId, nickname, zipCode);
  }
}
