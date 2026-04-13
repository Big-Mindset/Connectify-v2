/*
  Warnings:

  - You are about to drop the column `encryptedMetadata` on the `Media` table. All the data in the column will be lost.
  - Added the required column `media_objectKey` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Media" DROP COLUMN "encryptedMetadata",
ADD COLUMN     "media_objectKey" TEXT NOT NULL;
