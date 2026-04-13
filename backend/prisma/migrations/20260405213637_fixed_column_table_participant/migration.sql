-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "expiredAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "chat_participant" ADD COLUMN     "clearChatAt" TIMESTAMP(3);
