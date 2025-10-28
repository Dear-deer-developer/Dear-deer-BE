import { ValueOf } from '../utils/type-utils';

export const loginTypeValue = {
  NATIVE: 'NATIVE',
  SOCIAL: 'SOCIAL',
} as const;
export type LoginType = ValueOf<typeof loginTypeValue>;
