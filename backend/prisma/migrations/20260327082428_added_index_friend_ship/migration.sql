-- DropIndex
DROP INDEX "friendShip_user1Id_idx";

-- DropIndex
DROP INDEX "friendShip_user2Id_idx";

-- CreateIndex
CREATE INDEX "friendShip_user1Id_createdAt_idx" ON "friendShip"("user1Id", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "friendShip_user2Id_createdAt_idx" ON "friendShip"("user2Id", "createdAt" DESC);
