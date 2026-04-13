-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_groupChatId_fkey";

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_groupMessageId_fkey";

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_messageId_fkey";

-- DropForeignKey
ALTER TABLE "Status" DROP CONSTRAINT "Status_messageId_fkey";

-- AddForeignKey
ALTER TABLE "Status" ADD CONSTRAINT "Status_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_groupChatId_fkey" FOREIGN KEY ("groupChatId") REFERENCES "GroupChat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_groupMessageId_fkey" FOREIGN KEY ("groupMessageId") REFERENCES "GroupMessages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
