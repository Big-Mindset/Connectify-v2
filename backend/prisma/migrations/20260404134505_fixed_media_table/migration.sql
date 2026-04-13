/*
  Warnings:

  - You are about to drop the column `filename` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Media` table. All the data in the column will be lost.
  - Added the required column `encryptedMetadata` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Media" DROP COLUMN "filename",
DROP COLUMN "size",
DROP COLUMN "url",
ADD COLUMN     "encryptedMetadata" TEXT NOT NULL;
