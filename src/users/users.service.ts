import { Injectable } from '@nestjs/common';
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

  async updateNicknameAndZipCode(providerId: string, nickname: string) {
    const user = await this.userRepository.updateByProviderId(providerId, {
      nickname,
    });
    const zipCode = 10000 + user.id;

    return this.userRepository.updateByProviderId(providerId, {
      zipCode,
    });
  }
}
