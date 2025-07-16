import { ValueOf } from '../utils/type-utils';

export const LetterStatusValue = {
  WRITING: 'WRITING',
  SENT: 'SENT',
  RECEIVED: 'RECEIVED',
} as const;
export type LetterStatus = ValueOf<typeof LetterStatusValue>;
