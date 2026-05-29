/*
  Warnings:

  - You are about to drop the column `senderId` on the `reaction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "reaction" DROP CONSTRAINT "reaction_senderId_fkey";

-- AlterTable
ALTER TABLE "reaction" DROP COLUMN "senderId";

-- CreateTable
CREATE TABLE "reactionUsers" (
    "id" TEXT NOT NULL,
    "reactionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "reactionUsers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "reactionUsers" ADD CONSTRAINT "reactionUsers_reactionId_fkey" FOREIGN KEY ("reactionId") REFERENCES "reaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactionUsers" ADD CONSTRAINT "reactionUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
