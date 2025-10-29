/*
  Warnings:

  - A unique constraint covering the columns `[zip_code]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "users_zip_code_key" ON "users"("zip_code");
