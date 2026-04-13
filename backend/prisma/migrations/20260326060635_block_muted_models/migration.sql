-- DropForeignKey
ALTER TABLE "friendShip" DROP CONSTRAINT "friendShip_user1Id_fkey";

-- DropForeignKey
ALTER TABLE "friendShip" DROP CONSTRAINT "friendShip_user2Id_fkey";

-- DropIndex
DROP INDEX "request_receiverId_createdAt_idx";

-- DropIndex
DROP INDEX "request_senderId_createdAt_idx";

-- AlterTable
ALTER TABLE "GroupParticipants" ADD COLUMN     "muted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mutedTil" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "chat_participant" ADD COLUMN     "muted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mutedTil" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Block" (
    "id" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    "blockerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Block_blockerId_createdAt_idx" ON "Block"("blockerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Block_blockerId_blockedId_key" ON "Block"("blockerId", "blockedId");

-- CreateIndex
CREATE INDEX "request_senderId_status_idx" ON "request"("senderId", "status");

-- CreateIndex
CREATE INDEX "request_receiverId_status_idx" ON "request"("receiverId", "status");

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendShip" ADD CONSTRAINT "friendShip_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendShip" ADD CONSTRAINT "friendShip_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
