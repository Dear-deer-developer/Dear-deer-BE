import { ValueOf } from '../utils/type-utils';

export const GiftCategoryValue = {
  ORNAMENT: 'ORNAMENT',
  STAR: 'STAR',
  ELECTRIC_BULB: 'ELECTRIC_BULB',
  INTERIOR: 'INTERIOR',
  ANIMAL: 'ANIMAL',
} as const;
export type GiftCategory = ValueOf<typeof GiftCategoryValue>;
