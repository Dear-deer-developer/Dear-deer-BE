/*
  Warnings:

  - You are about to drop the column `image_url` on the `contents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "contents" DROP COLUMN "image_url";

-- CreateTable
CREATE TABLE "content_images" (
    "id" SERIAL NOT NULL,
    "content_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "content_images" ADD CONSTRAINT "content_images_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "contents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
