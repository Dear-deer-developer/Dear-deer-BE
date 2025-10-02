/*
  Warnings:

  - You are about to drop the column `obtainedAt` on the `user_gifts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_gifts" DROP COLUMN "obtainedAt",
ADD COLUMN     "user_id" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "calendar_reward_plans" (
    "localDate" DATE NOT NULL,
    "giftId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "calendar_reward_records" (
    "userId" INTEGER NOT NULL,
    "localDate" DATE NOT NULL,
    "giftId" INTEGER NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calendar_reward_records_pkey" PRIMARY KEY ("userId","localDate")
);

-- CreateIndex
CREATE UNIQUE INDEX "calendar_reward_plans_localDate_key" ON "calendar_reward_plans"("localDate");

-- CreateIndex
CREATE INDEX "calendar_reward_plans_giftId_idx" ON "calendar_reward_plans"("giftId");

-- CreateIndex
CREATE INDEX "calendar_reward_records_giftId_idx" ON "calendar_reward_records"("giftId");

-- AddForeignKey
ALTER TABLE "calendar_reward_plans" ADD CONSTRAINT "calendar_reward_plans_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "gifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_reward_records" ADD CONSTRAINT "calendar_reward_records_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "gifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
