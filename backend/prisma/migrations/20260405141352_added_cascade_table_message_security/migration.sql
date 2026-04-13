-- DropForeignKey
ALTER TABLE "message_securityKeys" DROP CONSTRAINT "message_securityKeys_messageId_fkey";

-- AddForeignKey
ALTER TABLE "message_securityKeys" ADD CONSTRAINT "message_securityKeys_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
