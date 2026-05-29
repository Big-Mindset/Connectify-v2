/*
  Warnings:

  - A unique constraint covering the columns `[emoji,messageId]` on the table `reaction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reactionId,userId]` on the table `reactionUsers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "reaction_emoji_messageId_key" ON "reaction"("emoji", "messageId");

-- CreateIndex
CREATE UNIQUE INDEX "reactionUsers_reactionId_userId_key" ON "reactionUsers"("reactionId", "userId");
