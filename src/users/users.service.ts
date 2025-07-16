import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly httpService: HttpService,
  ) {}

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

  async deleteUser(userId: number): Promise<void> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    await this.usersRepository.deleteUser(userId);
  }

  async getKakaoFriends(accessToken: string) {
    const url = 'https://kapi.kakao.com/v1/api/talk/friends';

    const response = await firstValueFrom(
      this.httpService.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    );

    return response.data;
  }
}
