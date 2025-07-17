/*
  Warnings:

  - The values [writing,sent,received] on the enum `LetterStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [appointment,popup,reservation,etc] on the enum `ScheduleCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LetterStatus_new" AS ENUM ('WRITING', 'SENT', 'RECEIVED');
ALTER TABLE "letters" ALTER COLUMN "status" TYPE "LetterStatus_new" USING ("status"::text::"LetterStatus_new");
ALTER TYPE "LetterStatus" RENAME TO "LetterStatus_old";
ALTER TYPE "LetterStatus_new" RENAME TO "LetterStatus";
DROP TYPE "LetterStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ScheduleCategory_new" AS ENUM ('APPOINTMENT', 'POPUP', 'RESERVATION', 'ETC');
ALTER TABLE "schedules" ALTER COLUMN "category" TYPE "ScheduleCategory_new" USING ("category"::text::"ScheduleCategory_new");
ALTER TYPE "ScheduleCategory" RENAME TO "ScheduleCategory_old";
ALTER TYPE "ScheduleCategory_new" RENAME TO "ScheduleCategory";
DROP TYPE "ScheduleCategory_old";
COMMIT;

-- =============================
-- ✅ 1) 새 LetterStatus ENUM 타입 만들기
-- =============================
CREATE TYPE "LetterStatus_new" AS ENUM ('WRITING', 'SENT', 'RECEIVED');

-- =============================
-- ✅ 2) 새 ScheduleCategory ENUM 타입 만들기
-- =============================
CREATE TYPE "ScheduleCategory_new" AS ENUM ('APPOINTMENT', 'POPUP', 'RESERVATION', 'ETC');

-- =============================
-- ✅ 3) 컬럼 타입 TEXT로 바꿔서 안전 캐스팅
-- =============================

-- letters.status 컬럼
ALTER TABLE "letters"
ALTER COLUMN "status"
TYPE TEXT USING "status"::text;

-- schedules.category 컬럼
ALTER TABLE "schedules"
ALTER COLUMN "category"
TYPE TEXT USING "category"::text;

-- =============================
-- ✅ 4) 기존 데이터 대문자로 UPDATE
-- =============================

-- letters.status
UPDATE "letters" SET "status" = 'WRITING' WHERE "status" = 'writing';
UPDATE "letters" SET "status" = 'SENT' WHERE "status" = 'sent';
UPDATE "letters" SET "status" = 'RECEIVED' WHERE "status" = 'received';

-- schedules.category
UPDATE "schedules" SET "category" = 'APPOINTMENT' WHERE "category" = 'appointment';
UPDATE "schedules" SET "category" = 'POPUP' WHERE "category" = 'popup';
UPDATE "schedules" SET "category" = 'RESERVATION' WHERE "category" = 'reservation';
UPDATE "schedules" SET "category" = 'ETC' WHERE "category" = 'etc';

-- =============================
-- ✅ 5) 컬럼 타입을 새 ENUM으로 교체
-- =============================

ALTER TABLE "letters"
ALTER COLUMN "status"
TYPE "LetterStatus_new"
USING "status"::text::"LetterStatus_new";

ALTER TABLE "schedules"
ALTER COLUMN "category"
TYPE "ScheduleCategory_new"
USING "category"::text::"ScheduleCategory_new";

-- =============================
-- ✅ 6) 기존 ENUM 타입 삭제
-- =============================

DROP TYPE "LetterStatus";
DROP TYPE "ScheduleCategory";

-- =============================
-- ✅ 7) 새 ENUM 이름 원래 이름으로 변경
-- =============================

ALTER TYPE "LetterStatus_new" RENAME TO "LetterStatus";
ALTER TYPE "ScheduleCategory_new" RENAME TO "ScheduleCategory";