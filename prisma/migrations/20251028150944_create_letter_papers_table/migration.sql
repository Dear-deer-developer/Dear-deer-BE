/*
  Warnings:

  - Added the required column `paper_id` to the `letters` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "letters" ADD COLUMN     "paper_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "letter_papers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "letter_papers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "letter_papers_name_key" ON "letter_papers"("name");

-- AddForeignKey
ALTER TABLE "letters" ADD CONSTRAINT "letters_paper_id_fkey" FOREIGN KEY ("paper_id") REFERENCES "letter_papers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
