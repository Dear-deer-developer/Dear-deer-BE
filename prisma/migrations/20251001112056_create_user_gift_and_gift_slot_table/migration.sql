/*
  Warnings:

  - You are about to drop the column `image_url` on the `gifts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `gifts` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "gifts" DROP COLUMN "image_url";

-- CreateTable
CREATE TABLE "user_gifts" (
    "userId" INTEGER NOT NULL,
    "giftId" INTEGER NOT NULL,
    "obtainedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_gifts_pkey" PRIMARY KEY ("userId","giftId")
);

-- CreateTable
CREATE TABLE "equip_category_rules" (
    "category" "GiftCategory" NOT NULL,
    "capacity" INTEGER NOT NULL,

    CONSTRAINT "equip_category_rules_pkey" PRIMARY KEY ("category")
);

-- CreateTable
CREATE TABLE "equip_category_slots" (
    "category" "GiftCategory" NOT NULL,
    "slot" INTEGER NOT NULL,

    CONSTRAINT "equip_category_slots_pkey" PRIMARY KEY ("category","slot")
);

-- CreateTable
CREATE TABLE "user_equip_slots" (
    "userId" INTEGER NOT NULL,
    "category" "GiftCategory" NOT NULL,
    "slot" INTEGER NOT NULL,
    "giftId" INTEGER NOT NULL,

    CONSTRAINT "user_equip_slots_pkey" PRIMARY KEY ("userId","category","slot")
);

-- CreateIndex
CREATE INDEX "user_gifts_userId_idx" ON "user_gifts"("userId");

-- CreateIndex
CREATE INDEX "user_equip_slots_userId_category_idx" ON "user_equip_slots"("userId", "category");

-- CreateIndex
CREATE INDEX "user_equip_slots_userId_idx" ON "user_equip_slots"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_equip_slots_userId_giftId_key" ON "user_equip_slots"("userId", "giftId");

-- CreateIndex
CREATE UNIQUE INDEX "gifts_name_key" ON "gifts"("name");

-- CreateIndex
CREATE INDEX "gifts_category_idx" ON "gifts"("category");

-- AddForeignKey
ALTER TABLE "user_gifts" ADD CONSTRAINT "user_gifts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_gifts" ADD CONSTRAINT "user_gifts_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "gifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_equip_slots" ADD CONSTRAINT "user_equip_slots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_equip_slots" ADD CONSTRAINT "user_equip_slots_category_slot_fkey" FOREIGN KEY ("category", "slot") REFERENCES "equip_category_slots"("category", "slot") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_equip_slots" ADD CONSTRAINT "user_equip_slots_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "gifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
