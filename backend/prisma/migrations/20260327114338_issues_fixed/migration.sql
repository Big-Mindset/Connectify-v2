/*
  Warnings:

  - You are about to drop the `friendShip` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_friendshipId_fkey";

-- DropForeignKey
ALTER TABLE "friendShip" DROP CONSTRAINT "friendShip_user1Id_fkey";

-- DropForeignKey
ALTER TABLE "friendShip" DROP CONSTRAINT "friendShip_user2Id_fkey";

-- DropTable
DROP TABLE "friendShip";

-- CreateTable
CREATE TABLE "friendship" (
    "id" TEXT NOT NULL,
    "user1Id" TEXT NOT NULL,
    "user2Id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "friendship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "friendship_user1Id_createdAt_idx" ON "friendship"("user1Id", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "friendship_user2Id_createdAt_idx" ON "friendship"("user2Id", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "friendship_user1Id_user2Id_key" ON "friendship"("user1Id", "user2Id");

-- AddForeignKey
ALTER TABLE "friendship" ADD CONSTRAINT "friendship_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendship" ADD CONSTRAINT "friendship_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_friendshipId_fkey" FOREIGN KEY ("friendshipId") REFERENCES "friendship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
