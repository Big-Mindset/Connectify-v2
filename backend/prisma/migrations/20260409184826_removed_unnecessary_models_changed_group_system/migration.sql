/*
  Warnings:

  - You are about to drop the column `groupChatId` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the `GroupChat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GroupMessages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GroupParticipants` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[chatPfpId]` on the table `Media` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "GroupMessages" DROP CONSTRAINT "GroupMessages_groupId_fkey";

-- DropForeignKey
ALTER TABLE "GroupMessages" DROP CONSTRAINT "GroupMessages_replyToId_fkey";

-- DropForeignKey
ALTER TABLE "GroupMessages" DROP CONSTRAINT "GroupMessages_senderId_fkey";

-- DropForeignKey
ALTER TABLE "GroupParticipants" DROP CONSTRAINT "GroupParticipants_groupId_fkey";

-- DropForeignKey
ALTER TABLE "GroupParticipants" DROP CONSTRAINT "GroupParticipants_userId_fkey";

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_groupChatId_fkey";

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_groupMessageId_fkey";

-- DropIndex
DROP INDEX "Media_groupChatId_key";

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "roles" "Roles" NOT NULL DEFAULT 'MEMBER';

-- AlterTable
ALTER TABLE "Media" DROP COLUMN "groupChatId",
ADD COLUMN     "chatId" TEXT,
ADD COLUMN     "chatPfpId" TEXT;

-- DropTable
DROP TABLE "GroupChat";

-- DropTable
DROP TABLE "GroupMessages";

-- DropTable
DROP TABLE "GroupParticipants";

-- CreateIndex
CREATE UNIQUE INDEX "Media_chatPfpId_key" ON "Media"("chatPfpId");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_chatPfpId_fkey" FOREIGN KEY ("chatPfpId") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
