import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { FoundUserDto } from './dtos/res-user.dto';

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

  async getUserInfoByUserId(userId: number) {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return user;
  }

  // 우편번호로 사용자 검색 (본인 제외)
  async findUserByZipCode(
    zipCode: number,
    myId: number,
  ): Promise<FoundUserDto> {
    if (zipCode === 12025) {
      throw new BadRequestException('12025는 검색할 수 없는 예시 번호입니다.');
    }

    // 1. 리포지토리에서 사용자 조회 (null일 수 있음)
    const user = await this.usersRepository.findUserByZipCode(zipCode, myId);

    // 2. 사용자가 없으면 404 에러 반환
    if (!user) {
      throw new NotFoundException(
        '해당 우편번호를 가진 사용자를 찾을 수 없습니다.',
      );
    }

    // 3. 사용자가 있으면 반환
    return user;
  }
}
