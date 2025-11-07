import { Provider } from '@nestjs/common';
import { AuthNativeRepository } from 'src/auth/auth-naitve/auth-native.repository';
import { SANTA_PROVIDER_ID } from 'src/calendar-reward/calender-reward.constants';

/**
 * LetterService에 캐시된 산타 ID를 주입하기 위한 고유 키
 */
export const SANTA_USER_ID = 'SANTA_USER_ID';

/**
 * 앱 시작 시 1회만 DB를 조회하여 산타 ID를 캐시/주입하는 커스텀 프로바이더
 */
export const SantaUserIdProvider: Provider = {
  provide: SANTA_USER_ID,
  useFactory: async (
    authNativeRepository: AuthNativeRepository,
  ): Promise<number> => {
    console.log('[Init] Finding Santa User ID...');
    // 1. providerId로 산타 유저를 DB에서 찾습니다.
    const santaUser =
      await authNativeRepository.findByProviderId(SANTA_PROVIDER_ID);

    if (!santaUser) {
      throw new Error(
        'FATAL: Santa User not found in database. Seed data is required.',
      );
    }

    console.log(`[Init] Santa User ID Cached: ${santaUser.id}`);
    // 2. 찾은 id를 반환합니다.
    return santaUser.id;
  },
  inject: [AuthNativeRepository], // useFactory에서 사용할 리포지토리
};
