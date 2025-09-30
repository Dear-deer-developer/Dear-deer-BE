/*
  Warnings:

  - Added the required column `music_id` to the `alarms` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "alarms" ADD COLUMN     "music_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "musics" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "musics_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "alarms" ADD CONSTRAINT "alarms_music_id_fkey" FOREIGN KEY ("music_id") REFERENCES "musics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
