-- prisma/migrations/XXXX_reset_giftcategory/migration.sql
BEGIN;

-- 1) 컬럼을 임시로 text로 바꿔 enum 의존성 제거 (테이블명은 "gifts")
ALTER TABLE "gifts"
  ALTER COLUMN "category" TYPE text
  USING "category"::text;

-- 2) 기존 enum 타입 제거 (Prisma가 예전에 만든 것이 "GiftCategory" 였다면 이렇게 써야 함)
DROP TYPE IF EXISTS "GiftCategory";

-- 3) 새 enum 타입 재정의 (원하는 값 세트)
CREATE TYPE "GiftCategory" AS ENUM (
  'ORNAMENT',
  'STAR',
  'ELECTRIC_BULB',
  'WALLPAPER',
  'GARLAND',
  'CARPET',
  'TRAIN',
  'GIFTBOX',
  'ANIMAL'
);

-- 4) 컬럼을 새 enum 타입으로 되돌리기
ALTER TABLE "gifts"
  ALTER COLUMN "category" TYPE "GiftCategory"
  USING "category"::"GiftCategory";

COMMIT;