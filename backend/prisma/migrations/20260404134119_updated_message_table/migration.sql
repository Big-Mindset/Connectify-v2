/*
  Warnings:

  - You are about to drop the column `enceyptedContent` on the `message_securityKeys` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "enceyptedContent" TEXT;

-- AlterTable
ALTER TABLE "message_securityKeys" DROP COLUMN "enceyptedContent";
