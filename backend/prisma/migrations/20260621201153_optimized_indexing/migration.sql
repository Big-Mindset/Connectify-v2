/*
  Warnings:

  - A unique constraint covering the columns `[messageId,emoji]` on the table `reaction` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Chat_pinnedAt_createdAt_idx";

-- DropIndex
DROP INDEX "reaction_emoji_messageId_key";

-- DropIndex
DROP INDEX "user_username_idx";

-- CreateIndex
CREATE INDEX "Message_chatId_idx" ON "Message"("chatId");

-- CreateIndex
CREATE UNIQUE INDEX "reaction_messageId_emoji_key" ON "reaction"("messageId", "emoji");
