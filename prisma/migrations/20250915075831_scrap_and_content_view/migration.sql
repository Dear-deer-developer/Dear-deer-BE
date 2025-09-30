-- CreateTable
CREATE TABLE "scraps" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "contentId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scraps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_views" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "contentId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "scraps_userId_contentId_key" ON "scraps"("userId", "contentId");

-- AddForeignKey
ALTER TABLE "scraps" ADD CONSTRAINT "scraps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scraps" ADD CONSTRAINT "scraps_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "contents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_views" ADD CONSTRAINT "content_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_views" ADD CONSTRAINT "content_views_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "contents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
