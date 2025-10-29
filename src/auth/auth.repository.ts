import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // PrismaService가 있다고 가정
import { User, RefreshToken, LoginType } from '@prisma/client';
import { AuthRegisterDto } from './dtos/auth-register.dto';

@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaService) {}

  // 이메일로 사용자 찾기 (자체 로그인 시 사용)
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // 아이디로 사용자 찾기 (자체 로그인 시 사용)
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

  // 회원가입 전 zipCode로 사용자 찾기
  async findUserByZipCode(zipCode: number): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        zipCode,
      },
    });
  }

  // 신규 사용자 생성 (자체 로그인)
  async createUser(
    data: Omit<AuthRegisterDto, 'password'> & {
      hashedPassword: string;
      zipCode: number;
    },
  ): Promise<User> {
    const { email, nickname, zipCode, hashedPassword } = data;
    return this.prisma.user.create({
      data: {
        email,
        hashedPassword,
        nickname,
        zipCode,
        loginType: LoginType.NATIVE, // 자체 로그인으로 설정
      },
    });
  }

  // 4. 리프레시 토큰 저장 또는 업데이트
  async saveRefreshToken(
    userId: number,
    token: string,
    expiresAt: Date,
  ): Promise<RefreshToken> {
    return this.prisma.refreshToken.upsert({
      where: { userId },
      update: { token, expiresAt },
      create: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  // 5. 유효한 리프레시 토큰 찾기
  async findRefreshToken(
    userId: number,
    token: string,
  ): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findFirst({
      where: {
        userId,
        token,
        expiresAt: {
          gt: new Date(), // 만료되지 않은 토큰만
        },
      },
    });
  }

  // 6. 리프레시 토큰 삭제 (로그아웃 시)
  async deleteRefreshToken(userId: number): Promise<void> {
    // 정말 이상하게 delete 메서드를 사용하면 에러가 뜸...
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}
