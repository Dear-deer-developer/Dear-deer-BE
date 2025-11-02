/*
  Warnings:

  - You are about to drop the column `giftId` on the `calendar_reward_plans` table. All the data in the column will be lost.
  - The primary key for the `calendar_reward_records` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `giftId` on the `calendar_reward_records` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `calendar_reward_records` table. All the data in the column will be lost.
  - The primary key for the `user_equip_slots` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `giftId` on the `user_equip_slots` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `user_equip_slots` table. All the data in the column will be lost.
  - The primary key for the `user_gifts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `giftId` on the `user_gifts` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `user_gifts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,gift_id]` on the table `user_equip_slots` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `gift_id` to the `calendar_reward_plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gift_id` to the `calendar_reward_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `calendar_reward_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gift_id` to the `user_equip_slots` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `user_equip_slots` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gift_id` to the `user_gifts` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `user_id` on the `user_gifts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "calendar_reward_plans" DROP CONSTRAINT "calendar_reward_plans_giftId_fkey";

-- DropForeignKey
ALTER TABLE "calendar_reward_records" DROP CONSTRAINT "calendar_reward_records_giftId_fkey";

-- DropForeignKey
ALTER TABLE "letters" DROP CONSTRAINT "letters_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "schedules" DROP CONSTRAINT "schedules_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_equip_slots" DROP CONSTRAINT "user_equip_slots_giftId_fkey";

-- DropForeignKey
ALTER TABLE "user_equip_slots" DROP CONSTRAINT "user_equip_slots_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_gifts" DROP CONSTRAINT "user_gifts_giftId_fkey";

-- DropForeignKey
ALTER TABLE "user_gifts" DROP CONSTRAINT "user_gifts_userId_fkey";

-- DropIndex
DROP INDEX "calendar_reward_plans_giftId_idx";

-- DropIndex
DROP INDEX "calendar_reward_records_giftId_idx";

-- DropIndex
DROP INDEX "user_equip_slots_userId_category_idx";

-- DropIndex
DROP INDEX "user_equip_slots_userId_giftId_key";

-- DropIndex
DROP INDEX "user_equip_slots_userId_idx";

-- DropIndex
DROP INDEX "user_gifts_userId_idx";

-- AlterTable
ALTER TABLE "calendar_reward_plans" DROP COLUMN "giftId",
ADD COLUMN     "gift_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "calendar_reward_records" DROP CONSTRAINT "calendar_reward_records_pkey",
DROP COLUMN "giftId",
DROP COLUMN "userId",
ADD COLUMN     "gift_id" INTEGER NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL,
ADD CONSTRAINT "calendar_reward_records_pkey" PRIMARY KEY ("user_id", "localDate");

-- AlterTable
ALTER TABLE "user_equip_slots" DROP CONSTRAINT "user_equip_slots_pkey",
DROP COLUMN "giftId",
DROP COLUMN "userId",
ADD COLUMN     "gift_id" INTEGER NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL,
ADD CONSTRAINT "user_equip_slots_pkey" PRIMARY KEY ("user_id", "category", "slot");

-- AlterTable
ALTER TABLE "user_gifts" DROP CONSTRAINT "user_gifts_pkey",
DROP COLUMN "giftId",
DROP COLUMN "userId",
ADD COLUMN     "gift_id" INTEGER NOT NULL,
ADD COLUMN     "obtained_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "user_id",
ADD COLUMN     "user_id" INTEGER NOT NULL,
ADD CONSTRAINT "user_gifts_pkey" PRIMARY KEY ("user_id", "gift_id");

-- CreateIndex
CREATE INDEX "calendar_reward_plans_gift_id_idx" ON "calendar_reward_plans"("gift_id");

-- CreateIndex
CREATE INDEX "calendar_reward_records_gift_id_idx" ON "calendar_reward_records"("gift_id");

-- CreateIndex
CREATE INDEX "user_equip_slots_user_id_category_idx" ON "user_equip_slots"("user_id", "category");

-- CreateIndex
CREATE INDEX "user_equip_slots_user_id_idx" ON "user_equip_slots"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_equip_slots_user_id_gift_id_key" ON "user_equip_slots"("user_id", "gift_id");

-- CreateIndex
CREATE INDEX "user_gifts_user_id_idx" ON "user_gifts"("user_id");

-- AddForeignKey
ALTER TABLE "letters" ADD CONSTRAINT "letters_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_gifts" ADD CONSTRAINT "user_gifts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_gifts" ADD CONSTRAINT "user_gifts_gift_id_fkey" FOREIGN KEY ("gift_id") REFERENCES "gifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_equip_slots" ADD CONSTRAINT "user_equip_slots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_equip_slots" ADD CONSTRAINT "user_equip_slots_gift_id_fkey" FOREIGN KEY ("gift_id") REFERENCES "gifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_reward_plans" ADD CONSTRAINT "calendar_reward_plans_gift_id_fkey" FOREIGN KEY ("gift_id") REFERENCES "gifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_reward_records" ADD CONSTRAINT "calendar_reward_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_reward_records" ADD CONSTRAINT "calendar_reward_records_gift_id_fkey" FOREIGN KEY ("gift_id") REFERENCES "gifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
