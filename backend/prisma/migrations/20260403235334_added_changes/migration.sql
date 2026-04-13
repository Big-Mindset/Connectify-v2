/*
  Warnings:

  - You are about to drop the column `content` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `privateKey` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `publicKey` on the `user` table. All the data in the column will be lost.
  - Added the required column `authTag` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vi` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Message_content_createdAt_idx";

-- DropIndex
DROP INDEX "user_privateKey_key";

-- DropIndex
DROP INDEX "user_publicKey_key";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "content",
ADD COLUMN     "authTag" TEXT NOT NULL,
ADD COLUMN     "enceyptedContent" TEXT,
ADD COLUMN     "vi" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "privateKey",
DROP COLUMN "publicKey";

-- CreateTable
CREATE TABLE "User_encryption_keys" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "ecryptedPrivateKey" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "authTag" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_encryption_keys_id_key" ON "User_encryption_keys"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_encryption_keys_userId_key" ON "User_encryption_keys"("userId");

-- CreateIndex
CREATE INDEX "Message_enceyptedContent_createdAt_idx" ON "Message"("enceyptedContent", "createdAt");

-- AddForeignKey
ALTER TABLE "User_encryption_keys" ADD CONSTRAINT "User_encryption_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
