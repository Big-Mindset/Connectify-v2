/*
  Warnings:

  - The `role` column on the `chat_participant` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `username` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "noficationType" AS ENUM ('FRIEND_REQUEST', 'Message', 'INVITE', 'Accepted');

-- AlterEnum
ALTER TYPE "Roles" ADD VALUE 'OWNER';

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "pinnedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "chat_participant" DROP COLUMN "role",
ADD COLUMN     "role" "Roles";

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "username" SET NOT NULL;

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "noficationType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Chat_lastMessageId_idx" ON "Chat"("lastMessageId");

-- CreateIndex
CREATE INDEX "Chat_pinnedAt_createdAt_idx" ON "Chat"("pinnedAt", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Status_readAt_idx" ON "Status"("readAt");

-- CreateIndex
CREATE INDEX "Status_deliveredAt_idx" ON "Status"("deliveredAt");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
