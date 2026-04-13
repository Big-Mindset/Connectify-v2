-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "search_index" TEXT[];

-- CreateIndex
CREATE INDEX "chat_participant_clearChatAt_idx" ON "chat_participant"("clearChatAt");

-- CreateIndex
CREATE INDEX "chat_participant_chatId_userId_idx" ON "chat_participant"("chatId", "userId");
