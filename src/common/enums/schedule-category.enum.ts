import { ValueOf } from '../utils/type-utils';

export const ScheduleCategoryValue = {
  APPOINTMENT: 'APPOINTMENT',
  POPUP: 'POPUP',
  RESERVATION: 'RESERVATION',
  ETC: 'ETC',
} as const;
export type ScheduleCategory = ValueOf<typeof ScheduleCategoryValue>;
