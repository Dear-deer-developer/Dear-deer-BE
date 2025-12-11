/*
  migration.sql (수정본)
  - Prisma가 생성한 'ADD COLUMN' / 'DROP COLUMN'을
  - 'RENAME COLUMN'으로 수정하여 데이터 손실 없이 컬럼명을 변경합니다.
*/

-- DropForeignKey (외래 키 제약 조건 임시 제거)
ALTER TABLE "content_images" DROP CONSTRAINT "content_images_content_id_fkey";
ALTER TABLE "content_sub_categories" DROP CONSTRAINT "content_sub_categories_mainCategoryId_fkey";
ALTER TABLE "content_views" DROP CONSTRAINT "content_views_contentId_fkey";
ALTER TABLE "content_views" DROP CONSTRAINT "content_views_userId_fkey";
ALTER TABLE "contents" DROP CONSTRAINT "contents_authorId_fkey";
ALTER TABLE "contents" DROP CONSTRAINT "contents_subCategoryId_fkey";
ALTER TABLE "scraps" DROP CONSTRAINT "scraps_contentId_fkey";
ALTER TABLE "scraps" DROP CONSTRAINT "scraps_userId_fkey";

-- DropIndex (인덱스 임시 제거)
DROP INDEX "scraps_userId_contentId_key";

/*
 * -------------------------------------------------
 * [핵심 수정 부분] RENAME을 사용하여 컬럼명 변경
 * -------------------------------------------------
 */

-- AlterTable calendar_reward_records
ALTER TABLE "calendar_reward_records" DROP CONSTRAINT "calendar_reward_records_pkey";
ALTER TABLE "calendar_reward_records" RENAME COLUMN "localDate" TO "local_date";
ALTER TABLE "calendar_reward_records" RENAME COLUMN "receivedAt" TO "received_at";
ALTER TABLE "calendar_reward_records" ADD CONSTRAINT "calendar_reward_records_pkey" PRIMARY KEY ("user_id", "local_date");

-- AlterTable content_sub_categories
ALTER TABLE "content_sub_categories" RENAME COLUMN "mainCategoryId" TO "main_category_id";

-- AlterTable content_views
ALTER TABLE "content_views" RENAME COLUMN "contentId" TO "content_id";
ALTER TABLE "content_views" RENAME COLUMN "userId" TO "user_id";

-- AlterTable contents
ALTER TABLE "contents" RENAME COLUMN "authorId" TO "author_id";
ALTER TABLE "contents" RENAME COLUMN "subCategoryId" TO "sub_category_id";

-- AlterTable scraps
ALTER TABLE "scraps" RENAME COLUMN "contentId" TO "content_id";
ALTER TABLE "scraps" RENAME COLUMN "userId" TO "user_id";

/*
 * -------------------------------------------------
 * [수정 종료] - 이하 원본과 동일 (새 이름으로 인덱스/외래키 재생성)
 * -------------------------------------------------
 */

-- CreateIndex (새 이름으로 인덱스 생성)
CREATE UNIQUE INDEX "scraps_user_id_content_id_key" ON "scraps"("user_id", "content_id");

-- AddForeignKey (새 이름으로 외래 키 다시 연결)
ALTER TABLE "contents" ADD CONSTRAINT "contents_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "contents" ADD CONSTRAINT "contents_sub_category_id_fkey" FOREIGN KEY ("sub_category_id") REFERENCES "content_sub_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "content_images" ADD CONSTRAINT "content_images_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_sub_categories" ADD CONSTRAINT "content_sub_categories_main_category_id_fkey" FOREIGN KEY ("main_category_id") REFERENCES "content_main_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "scraps" ADD CONSTRAINT "scraps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "scraps" ADD CONSTRAINT "scraps_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_views" ADD CONSTRAINT "content_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_views" ADD CONSTRAINT "content_views_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;