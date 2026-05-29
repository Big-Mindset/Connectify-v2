-- DropForeignKey
ALTER TABLE "reactionUsers" DROP CONSTRAINT "reactionUsers_reactionId_fkey";

-- AddForeignKey
ALTER TABLE "reactionUsers" ADD CONSTRAINT "reactionUsers_reactionId_fkey" FOREIGN KEY ("reactionId") REFERENCES "reaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
