-- DropForeignKey
ALTER TABLE "reaction" DROP CONSTRAINT "reaction_messageId_fkey";

-- AddForeignKey
ALTER TABLE "reaction" ADD CONSTRAINT "reaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
