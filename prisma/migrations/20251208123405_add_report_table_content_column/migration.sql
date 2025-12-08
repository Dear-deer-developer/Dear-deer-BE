/*
  Warnings:

  - Added the required column `content` to the `reports` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "content" TEXT NOT NULL;
