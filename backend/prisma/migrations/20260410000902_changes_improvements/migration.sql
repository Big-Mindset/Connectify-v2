-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "description" TEXT,
ADD COLUMN     "isGroup" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "Status" ADD COLUMN     "userId" TEXT,
ALTER COLUMN "readAt" DROP NOT NULL,
ALTER COLUMN "readAt" DROP DEFAULT,
ALTER COLUMN "deliveredAt" DROP NOT NULL,
ALTER COLUMN "deliveredAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Chat_friendshipId_idx" ON "Chat"("friendshipId");

-- AddForeignKey
ALTER TABLE "Status" ADD CONSTRAINT "Status_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
