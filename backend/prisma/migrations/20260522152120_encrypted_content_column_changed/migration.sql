/*
  Warnings:

  - You are about to drop the column `enceyptedContent` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "enceyptedContent",
ADD COLUMN     "encryptedContent" TEXT;
