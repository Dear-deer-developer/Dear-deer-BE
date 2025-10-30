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

/**
 * GiftCategoryValue의 키 순서를 그대로 배열로 만듭니다.
 * ['ORNAMENT', 'STAR', 'ELECTRIC_BULB', ...]
 * (주의: GiftCategory '타입'이 아닌 GiftCategoryValue '값'을 사용해야 합니다)
 */
export const CATEGORY_ORDER = Object.keys(GiftCategoryValue) as GiftCategory[];

/**
 * 카테고리 정렬 순서를 빠르게 조회하기 위한 Map
 * { 'ORNAMENT' => 0, 'STAR' => 1, 'ELECTRIC_BULB' => 2, ... }
 */
export const categoryRankMap = new Map<GiftCategory, number>(
  CATEGORY_ORDER.map((category, index) => [category, index]),
);
