-- DropIndex
DROP INDEX "chat_participant_chatId_userId_idx";

-- DropIndex
DROP INDEX "chat_participant_clearChatAt_idx";

-- DropIndex
DROP INDEX "chat_participant_userId_idx";

-- CreateIndex
CREATE INDEX "chat_participant_chatId_idx" ON "chat_participant"("chatId");
