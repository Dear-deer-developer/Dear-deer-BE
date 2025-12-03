import { ValueOf } from '../utils/type-utils';

export const reportReasonValue = {
  IMPERSONATION_FRAUD: 'IMPERSONATION_FRAUD', // 유출/사칭/사기
  SEXUAL_CONTENT: 'SEXUAL_CONTENT', // 음란물/불건전한 대화
  SPAM_AND_PHISHING: 'SPAM_AND_PHISHING', // 낚시/놀람/도배
  ABUSIVE_LANGUAGE: 'ABUSIVE_LANGUAGE', // 욕설/비하
  COMMERCIAL_AD: 'COMMERCIAL_AD', // 상업적 광고 및 판매
  POLITICAL_PROPAGANDA: 'POLITICAL_PROPAGANDA', // 정당/정치인 비하 및 선거운동
} as const;

export type ReportReason = ValueOf<typeof reportReasonValue>;
