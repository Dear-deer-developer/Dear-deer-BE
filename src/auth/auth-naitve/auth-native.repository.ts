import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // PrismaService가 있다고 가정
import { User, RefreshToken, LoginType } from '@prisma/client';
import { AuthRegisterDto } from '../dtos/auth-register.dto';

@Injectable()
export class AuthNativeRepository {
  constructor(private prisma: PrismaService) {}

  // userId로 사용자 찾기
  async findById(userId: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  // 이메일로 사용자 찾기 (자체 로그인 시 사용)
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // 닉네임으로 사용자 찾기 (회원가입 시 중복 확인)
  async findByNickname(nickname: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { nickname },
    });
  }

  // zipCode로 사용자 찾기
  async findByZipCode(zipCode: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { zipCode },
    });
  }

  // providerId로 사용자 찾기
  async findByProviderId(providerId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { providerId: providerId },
    });
  }

  // 신규 사용자 생성 (자체 로그인)
  async createUser(
    data: Omit<AuthRegisterDto, 'password'> & {
      hashedPassword: string;
      zipCode: number;
    },
  ): Promise<User> {
    const { email, nickname, zipCode, hashedPassword, isAgreed } = data;
    return this.prisma.user.create({
      data: {
        email,
        hashedPassword,
        nickname,
        zipCode,
        isAgreed,
        loginType: LoginType.NATIVE, // 자체 로그인으로 설정
      },
    });
  }

  // 리프레시 토큰 저장 또는 업데이트
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

  // 유효한 리프레시 토큰 찾기
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

  // 리프레시 토큰 삭제 (로그아웃 시)
  async deleteRefreshToken(userId: number): Promise<void> {
    // 정말 이상하게 delete 메서드를 사용하면 에러가 뜸...
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  // 인증코드 upsert
  async upsertAuthCode(email: string, code: string, expiredAt: Date) {
    return this.prisma.authCode.upsert({
      where: { email },
      update: {
        code,
        expiredAt,
        attemptCount: 0, // 시도 횟수 초기화
        isVerified: false, // 인증 상태 초기화
      },
      create: {
        email,
        code,
        expiredAt,
      },
    });
  }

  // 인증코드 검증시 사용
  async findAuthCodeByEmail(email: string) {
    const authCode = await this.prisma.authCode.findUnique({
      where: { email },
    });
    return authCode;
  }

  // 코드 검증시 입력 횟수 1 증가
  async incrementAttemptCount(email: string): Promise<number> {
    const updatedAuthCode = await this.prisma.authCode.update({
      where: {
        email: email,
      },
      data: {
        attemptCount: {
          increment: 1,
        },
      },
    });

    // 반환된 객체에서 업데이트된 시도 횟수를 추출하여 반환
    return updatedAuthCode.attemptCount;
  }

  // 인증코드 시간 만료 or 입력 횟수 초과시 호출
  async deleteAuthCodeByEmail(email: string) {
    await this.prisma.authCode.delete({ where: { email } });
  }

  // 이메일에 해당하는 인증 코드 상태를 true로 변경
  async isVerifiedToTrue(email: string): Promise<void> {
    await this.prisma.authCode.update({
      where: {
        email,
      },
      data: {
        isVerified: true,
      },
    });
  }

  // 새 비밀번호 설정
  async updatePassword(userId: number, newHashedPassword: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        hashedPassword: newHashedPassword,
      },
    });
  }

  // 사용자 삭제 (탈퇴시 사용)
  async deleteUserById(userId: number): Promise<void> {
    await this.prisma.user.delete({
      where: { id: userId },
    });
  }
}
