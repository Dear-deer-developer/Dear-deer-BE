import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../Email/auth-email.service';
import { TokenResponseDto } from '../dtos/token-res.dto';
import { JwtPayload } from '../interface/jwt.interface';
import { AuthLoginDto } from '../dtos/auth-login.dto';
import { AuthRegisterDto } from '../dtos/auth-register.dto';
import { AuthNativeRepository } from './auth-native.repository';
import { create6DigitCode } from '../functions/digit-code';
import { AuthWithdrawDto } from '../dtos/auth-withdraw.dto';
import { loginTypeValue } from 'src/common/enums/login-type.enum';

@Injectable()
export class AuthNativeService {
  constructor(
    private readonly authNativeRepository: AuthNativeRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * JWT 쌍 생성
   */
  private async getTokens(user: {
    id: number;
    isAdmin: boolean;
  }): Promise<TokenResponseDto> {
    const payload: JwtPayload = { sub: user.id, isAdmin: user.isAdmin };

    // 1. Access Token 생성
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: parseInt(
        this.configService.get<string>('ACCESS_TOKEN_EXPIRY_TIME'),
        10,
      ),
    } as JwtSignOptions);

    // 2. Refresh Token 생성
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: parseInt(
        this.configService.get<string>('REFRESH_TOKEN_EXPIRY_TIME'),
        10,
      ),
    } as JwtSignOptions);

    // 3. Refresh Token의 만료 시각 계산 및 DB 저장
    const expiryDate = new Date();
    expiryDate.setDate(
      expiryDate.getDate() +
        parseInt(
          this.configService.get<string>('REFRESH_TOKEN_EXPIRY_TIME_FOR_DB'),
          10, // 10진수로 변경
        ),
    );

    await this.authNativeRepository.saveRefreshToken(
      user.id,
      refreshToken,
      expiryDate,
    );

    return { accessToken, refreshToken };
  }

  private async generateUniqueZipCode(): Promise<number> {
    while (true) {
      // 1. 10000 ~ 99999 사이의 5자리 정수 생성 (12025 제외)
      const zipCode = Math.floor(10000 + Math.random() * 90000);
      if (zipCode === 12025) continue; // 12025 예외 처리
      // 2. DB에서 이 zipCode를 누가 쓰고 있는지 확인

      const existingUser =
        await this.authNativeRepository.findByZipCode(zipCode); // 3. 아무도 안 쓰고 있다면 (null) 이 번호 반환

      if (!existingUser) {
        return zipCode;
      }
    }
  }

  // 회원가입
  async register(dto: AuthRegisterDto): Promise<TokenResponseDto> {
    if (dto.isAgreed !== true) {
      throw new BadRequestException(
        '필수 약관에 동의해야 회원가입이 가능합니다.',
      );
    }
    // 0. 이메일 인증 확인
    const authCode = await this.authNativeRepository.findAuthCodeByEmail(
      dto.email,
    );
    if (!authCode || !authCode.isVerified) {
      throw new UnauthorizedException('이메일 인증이 완료되지 않았습니다.');
    }

    // 1. 이메일, 닉네임 중복 확인
    const emailExists = await this.authNativeRepository.findByEmail(dto.email);
    if (emailExists) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    const nicknameExists = await this.authNativeRepository.findByNickname(
      dto.nickname,
    );
    if (nicknameExists) {
      throw new ConflictException('이미 사용 중인 닉네임입니다.');
    }

    // 2. 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(
      dto.password,
      Number(this.configService.get<number>('BCRYPT_SALT_ROUNDS')),
    );

    // 3. 고유 우편번호 생성
    const uniqueZipCode = await this.generateUniqueZipCode();

    // 4. 사용자 생성 (NATIVE 타입으로)
    const newUser = await this.authNativeRepository.createUser({
      ...dto,
      hashedPassword,
      zipCode: uniqueZipCode,
    });

    // 5. 인증코드를 삭제
    await this.authNativeRepository.deleteAuthCodeByEmail(dto.email);

    // 6. 토큰 발급 및 리프레시 토큰 저장
    return this.getTokens(newUser);
  }

  // 이메일 중복 확인
  async checkEmailExists(email: string): Promise<{ message: string }> {
    const emailExists = await this.authNativeRepository.findByEmail(email);
    if (emailExists) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }
    return { message: '사용 가능한 이메일입니다.' };
  }

  // 닉네임 중복 확인
  async checkNicknameExists(nickname: string): Promise<{ message: string }> {
    const nicknameExists =
      await this.authNativeRepository.findByNickname(nickname);
    if (nicknameExists) {
      throw new ConflictException('이미 사용 중인 닉네임입니다.');
    }
    return { message: '사용 가능한 닉네임입니다.' };
  }

  // 로그인
  async login(dto: AuthLoginDto): Promise<TokenResponseDto> {
    // 1. 이메일로 사용자 찾기
    const user = await this.authNativeRepository.findByEmail(dto.email);

    // 사용자가 없거나 (NATIVE가 아닌 다른 타입일 수 있음), 비밀번호가 없으면 에러
    if (!user || user.loginType !== 'NATIVE' || !user.hashedPassword) {
      throw new UnauthorizedException(
        '유효하지 않은 이메일 또는 비밀번호입니다.',
      );
    }

    // 2. 비밀번호 비교
    const isPasswordMatch = await bcrypt.compare(
      dto.password,
      user.hashedPassword,
    );
    if (!isPasswordMatch) {
      throw new UnauthorizedException(
        '유효하지 않은 이메일 또는 비밀번호입니다.',
      );
    }

    // 3. 토큰 발급 및 리프레시 토큰 저장
    return this.getTokens(user);
  }

  // 리프레시 토큰 갱신
  async refreshTokens(refreshToken: string): Promise<TokenResponseDto> {
    let payload: JwtPayload;

    if (!refreshToken) {
      throw new NotFoundException('Refresh token not found in headers');
    }

    try {
      // 1. JWT 서명 검증 (토큰이 변조되지 않았는지)
      // verifyAsync의 ignoreExpiration: true로 설정하여 만료 여부는 DB에서 판단
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        ignoreExpiration: true,
      });
    } catch (error) {
      throw new UnauthorizedException(
        '유효하지 않거나 변조된 갱신 토큰입니다.',
      );
    }

    const userId = payload.sub;

    // 2. DB에서 토큰 및 만료 시간 확인
    const storedToken = await this.authNativeRepository.findRefreshToken(
      userId,
      refreshToken,
    );

    if (!storedToken) {
      // DB에 없거나 만료된 토큰
      throw new UnauthorizedException(
        '갱신 토큰이 만료되었거나 이미 사용되었습니다.',
      );
    }

    // 3. 이전 리프레시 토큰 삭제
    await this.authNativeRepository.deleteRefreshToken(userId);

    // 4. 새로운 토큰 쌍 발급 (재발급 시점에서 admin 여부 확인 가능)
    const user = await this.authNativeRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('사용자 정보를 찾을 수 없습니다.');
    }

    return this.getTokens(user);
  }

  // 로그아웃 로직 (리프레시 토큰 삭제)
  async logout(userId: number): Promise<void> {
    // DB에서 리프레시 토큰을 삭제하여 강제 로그아웃
    await this.authNativeRepository.deleteRefreshToken(userId);
  }

  // 회원가입할 때 인증코드 발송 (이메일 인증코드 발송 + DB에 코드 저장)
  async sendRegisterCode(email: string): Promise<{ message: string }> {
    // 1. [핵심] 이미 가입된 이메일인지 먼저 확인합니다.
    const emailExists = await this.authNativeRepository.findByEmail(email);
    if (emailExists) {
      // 이미 유저가 있다면, 에러를 발생시켜 가입을 막습니다.
      throw new ConflictException('이미 가입된 이메일입니다.');
    }

    // 2. 가입되지 않은 이메일이라면, 코드 생성 및 발송 로직을 수행합니다.
    const code = create6DigitCode();
    const expiryMinutes = this.configService.get<number>('CODE_EXPIRY_MINUTES');
    const expiredAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    try {
      await this.authNativeRepository.upsertAuthCode(email, code, expiredAt);
      await this.emailService.sendAuthCode(email, code);
      return { message: '인증 코드를 이메일로 발송했습니다.' };
    } catch (dbError) {
      console.error('DB Error on saving auth code:', dbError);
      throw new InternalServerErrorException(
        '인증 코드 생성 중 서버 오류가 발생했습니다.',
      );
    }
  }

  // 비밀번호 찾을 때 인증코드 발송 (이메일 인증코드 발송 + DB에 코드 저장)
  async sendPasswordResetCode(email: string): Promise<{ message: string }> {
    // 1. 유효성 검사: 이메일이 등록된 사용자인지 확인
    const user = await this.authNativeRepository.findByEmail(email);

    // 2. 보안상의 이유로 계정 존재 여부를 외부에 알리지 않음 = 유저가 없어도 같은 메시지 반환
    if (!user) {
      return { message: '인증 코드를 이메일로 발송했습니다.' };
    }

    // 3. 6자리 코드 생성 및 만료 시간 설정
    const code = create6DigitCode();
    const expiryMinutes = this.configService.get<number>('CODE_EXPIRY_MINUTES');
    const expiredAt = new Date(Date.now() + expiryMinutes * 60 * 1000); // 현재 시간 + 5분

    try {
      // 4. 기존 코드 삭제 후 새 코드 저장 (UPSERT)
      await this.authNativeRepository.upsertAuthCode(email, code, expiredAt);

      // 5. 이메일 발송
      await this.emailService.sendAuthCode(email, code);

      return { message: '인증 코드를 이메일로 발송했습니다.' };
    } catch (dbError) {
      // DB 저장 오류 처리
      console.error('DB Error on saving auth code:', dbError);
      throw new InternalServerErrorException(
        '인증 코드 생성 중 서버 오류가 발생했습니다.',
      );
    }
  }

  // 인증코드 검증 중복 로직을 메서드로 통합
  private async _verifyCode(email: string, submittedCode: string) {
    // 1. 입력한 email로 만들어진 인증코드가 있는지
    const authCode = await this.authNativeRepository.findAuthCodeByEmail(email);
    if (!authCode) {
      throw new BadRequestException('인증 코드를 먼저 요청해 주세요.');
    }

    // 2. 인증코드 만료시간이 지나지 않았는지
    if (new Date() > authCode.expiredAt) {
      await this.authNativeRepository.deleteAuthCodeByEmail(email);
      throw new BadRequestException(
        '인증 시간이 만료되었습니다. 코드를 다시 요청해 주세요.',
      );
    }

    // 3. 코드 일치 여부 및 입력 횟수 검사
    if (authCode.code !== submittedCode) {
      // 3-1. 코드 틀리면 입력 횟수 1 증가
      const newAttemptCount =
        await this.authNativeRepository.incrementAttemptCount(email);

      // 3-2. 횟수 증가 후 최대 입력 횟수 넘었는지 검사
      const MAX_ATTEMPTS = 5;
      if (newAttemptCount >= MAX_ATTEMPTS) {
        // 5번보다 많다면 인증 코드 삭제하고 '횟수 초과' 에러 발송
        await this.authNativeRepository.deleteAuthCodeByEmail(email);
        throw new BadRequestException(
          '입력 횟수를 초과했습니다. 새로운 인증 코드를 요청해 주세요.',
        );
      } else {
        // 아직 5번이 안 되었다면 '불일치' 에러를 보냅니다.
        throw new BadRequestException({
          message: '인증 코드가 일치하지 않습니다.',
          attemptCount: newAttemptCount,
        });
      }
    }
    return authCode;
  }

  // 회원가입 시 코드 검증
  async verifyRegisterCode(
    email: string,
    submittedCode: string,
  ): Promise<{ message: string }> {
    // 1. 인증코드 검증
    await this._verifyCode(email, submittedCode);
    // 2. 인증 코드의 인증상태 변경(-> true)
    await this.authNativeRepository.isVerifiedToTrue(email);

    return {
      message: '인증 코드가 일치합니다. 회원가입을 진행해 주세요.',
    };
  }

  // 비밀번호 찾기시 코드 검증
  async verifyPasswordCode(
    email: string,
    submittedCode: string,
  ): Promise<TokenResponseDto> {
    // 1. 유저가 있는지
    const user = await this.authNativeRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('유효하지 않은 이메일 주소입니다.');
    }

    // 2. 인증코드 검증
    await this._verifyCode(email, submittedCode);

    // 3. 검증에 통과했다면 인증코드를 삭제
    await this.authNativeRepository.deleteAuthCodeByEmail(email);

    return this.getTokens(user);
  }

  // 새 비밀번호 설정
  async setNewPassword(
    userId: number,
    newPassword: string,
  ): Promise<{ message: string }> {
    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(
      newPassword,
      Number(this.configService.get<number>('BCRYPT_SALT_ROUNDS')),
    );

    await this.authNativeRepository.updatePassword(userId, hashedPassword);

    return {
      message: '비밀번호가 성공적으로 변경되었습니다. 다시 로그인해 주세요.',
    };
  }

  // 마이페이지에서 새 비밀번호 설정할 때 현재 비밀번호 검증
  async verifyCurrentPassword(
    userId: number,
    currentPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.authNativeRepository.findById(userId);
    if (!user || !user.hashedPassword) {
      throw new NotFoundException('사용자 정보를 찾을 수 없습니다.');
    }

    const isPasswordMatch = await bcrypt.compare(
      currentPassword,
      user.hashedPassword,
    );
    if (!isPasswordMatch) {
      throw new UnauthorizedException('현재 비밀번호가 일치하지 않습니다.');
    }

    return {
      message: '비밀번호가 확인되었습니다. 새 비밀번호를 입력해 주세요.',
    };
  }

  // 회원탈퇴
  async withdraw(userId: number, dto: AuthWithdrawDto): Promise<void> {
    // 1. 사용자 정보 조회 (비밀번호, 로그인 타입 포함)
    const user = await this.authNativeRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 2. 소셜 로그인 사용자인지 확인
    if (user.loginType !== loginTypeValue.NATIVE) {
      throw new BadRequestException(
        '소셜 로그인 유저는 이 경로로 탈퇴할 수 없습니다.',
      );
    }

    // 3. 비밀번호 비교
    const isPasswordMatch = await bcrypt.compare(
      dto.password,
      user.hashedPassword,
    );

    if (!isPasswordMatch) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    // 4. 사용자 삭제
    try {
      await this.authNativeRepository.deleteUserById(userId);
    } catch (error) {
      // (예: DB 오류 처리)
      throw new InternalServerErrorException(
        '회원 탈퇴 중 오류가 발생했습니다.',
      );
    }
  }

  // 이메일로 아이디 찾기 (이메일로 아이디 정보 발송) 은 리젝 되면 이어서 만들기 (10.18)
  // async findUsernameByEmail(email: string): Promise<{ message: string }> {
  //   const user = await this.authNativeRepository.findByEmail(email);

  //   if (!user) {
  //     // 계정 존재 여부를 알리지 않기 위해 성공 메시지와 동일하게 반환
  //     return { message: '아이디 정보를 해당 이메일로 발송했습니다.' };
  //   }

  //   try {
  //     // EmailService에 sendUsernameInfo(email, username) 메서드를 추가하여 실제 발송 로직 구현
  //     // await this.emailService.sendUsernameInfo(email, user.);

  //     return { message: '아이디 정보를 해당 이메일로 발송했습니다.' };
  //   } catch (e) {
  //     throw new InternalServerErrorException(
  //       '아이디 정보 발송 중 오류가 발생했습니다.',
  //     );
  //   }
  // }
}
