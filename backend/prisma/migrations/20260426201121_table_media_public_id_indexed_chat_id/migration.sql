/*
  Warnings:

  - You are about to drop the column `media_objectKey` on the `Media` table. All the data in the column will be lost.
  - Added the required column `publicId` to the `Media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Media" DROP COLUMN "media_objectKey",
ADD COLUMN     "publicId" TEXT NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Media_chatId_idx" ON "Media"("chatId");
