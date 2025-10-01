import { ValueOf } from '../utils/type-utils';

export const GiftCategoryValue = {
  ORNAMENT: 'ORNAMENT',
  STAR: 'STAR',
  ELECTRIC_BULB: 'ELECTRIC_BULB',
  WALLPAPER: 'WALLPAPER',
  GARLAND: 'GARLAND',
  CARPET: 'CARPET',
  TRAIN: 'TRAIN',
  GIFTBOX: 'GIFTBOX',
  ANIMAL: 'ANIMAL',
} as const;
export type GiftCategory = ValueOf<typeof GiftCategoryValue>;
