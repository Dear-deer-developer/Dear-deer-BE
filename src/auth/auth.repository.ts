import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // PrismaService가 있다고 가정
import { User } from '@prisma/client';

@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaService) {}

  // 아이디로 사용자 찾기
  async findById(userId: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  // 닉네임으로 사용자 찾기 (회원가입 시 중복 확인)
  async findByNickname(nickname: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { nickname },
    });
  }
}
