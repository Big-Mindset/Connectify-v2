/*
  Warnings:

  - You are about to drop the column `emojiCode` on the `reaction` table. All the data in the column will be lost.
  - Added the required column `emoji` to the `reaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "reaction" DROP COLUMN "emojiCode",
ADD COLUMN     "emoji" TEXT NOT NULL,
ADD COLUMN     "name" TEXT;
