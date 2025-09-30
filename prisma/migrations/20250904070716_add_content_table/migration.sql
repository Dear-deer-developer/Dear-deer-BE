-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('WRITING', 'PUBLISHED', 'HIDDEN');

-- CreateTable
CREATE TABLE "contents" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "image_url" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'WRITING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "authorId" INTEGER NOT NULL,
    "subCategoryId" INTEGER NOT NULL,

    CONSTRAINT "contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_main_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "content_main_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_sub_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "mainCategoryId" INTEGER NOT NULL,

    CONSTRAINT "content_sub_categories_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "content_sub_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_sub_categories" ADD CONSTRAINT "content_sub_categories_mainCategoryId_fkey" FOREIGN KEY ("mainCategoryId") REFERENCES "content_main_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
