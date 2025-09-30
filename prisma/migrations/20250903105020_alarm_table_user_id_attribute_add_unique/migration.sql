/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `alarms` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "alarms_user_id_key" ON "alarms"("user_id");
