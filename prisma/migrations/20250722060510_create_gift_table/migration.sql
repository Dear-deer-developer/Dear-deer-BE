-- CreateEnum
CREATE TYPE "GiftCategory" AS ENUM ('ORNAMENT', 'STAR', 'ELECTRIC_BULB', 'INTERIOR', 'ANIMAL');

-- CreateTable
CREATE TABLE "gifts" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" "GiftCategory" NOT NULL,
    "image_url" TEXT NOT NULL,

    CONSTRAINT "gifts_pkey" PRIMARY KEY ("id")
);
