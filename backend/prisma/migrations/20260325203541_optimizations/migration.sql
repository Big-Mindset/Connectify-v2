/*
  Warnings:

  - A unique constraint covering the columns `[friendshipId]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `friendshipId` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "request_receiverId_idx";

-- DropIndex
DROP INDEX "request_senderId_idx";

-- DropIndex
DROP INDEX "request_senderId_receiverId_idx";

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "friendshipId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "friendShip" (
    "id" TEXT NOT NULL,
    "user1Id" TEXT NOT NULL,
    "user2Id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "friendShip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "friendShip_user1Id_idx" ON "friendShip"("user1Id");

-- CreateIndex
CREATE INDEX "friendShip_user2Id_idx" ON "friendShip"("user2Id");

-- CreateIndex
CREATE UNIQUE INDEX "friendShip_user1Id_user2Id_key" ON "friendShip"("user1Id", "user2Id");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_friendshipId_key" ON "Chat"("friendshipId");

-- CreateIndex
CREATE INDEX "request_senderId_createdAt_idx" ON "request"("senderId", "createdAt");

-- CreateIndex
CREATE INDEX "request_receiverId_createdAt_idx" ON "request"("receiverId", "createdAt");

-- AddForeignKey
ALTER TABLE "friendShip" ADD CONSTRAINT "friendShip_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendShip" ADD CONSTRAINT "friendShip_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_friendshipId_fkey" FOREIGN KEY ("friendshipId") REFERENCES "friendShip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
