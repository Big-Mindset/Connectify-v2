-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_friendshipId_fkey";

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_friendshipId_fkey" FOREIGN KEY ("friendshipId") REFERENCES "friendship"("id") ON DELETE CASCADE ON UPDATE CASCADE;
