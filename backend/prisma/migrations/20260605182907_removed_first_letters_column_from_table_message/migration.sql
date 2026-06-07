/*
  Warnings:

  - You are about to drop the column `firstLetters_index` on the `Message` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Message_firstLetters_index_idx";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "firstLetters_index";
