/*
  Warnings:

  - You are about to drop the column `authTag` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `enceyptedContent` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `vi` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the `User_encryption_keys` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chat_E2EE_Keys` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "User_encryption_keys" DROP CONSTRAINT "User_encryption_keys_userId_fkey";

-- DropForeignKey
ALTER TABLE "chat_E2EE_Keys" DROP CONSTRAINT "chat_E2EE_Keys_chatId_fkey";

-- DropForeignKey
ALTER TABLE "chat_E2EE_Keys" DROP CONSTRAINT "chat_E2EE_Keys_userId_fkey";

-- DropIndex
DROP INDEX "Message_enceyptedContent_createdAt_idx";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "authTag",
DROP COLUMN "enceyptedContent",
DROP COLUMN "vi";

-- DropTable
DROP TABLE "User_encryption_keys";

-- DropTable
DROP TABLE "chat_E2EE_Keys";

-- CreateTable
CREATE TABLE "message_securityKeys" (
    "id" TEXT NOT NULL,
    "enceyptedContent" TEXT,
    "vi_v1" TEXT NOT NULL,
    "authTag_v1" TEXT NOT NULL,
    "vi_v2" TEXT NOT NULL,
    "authTag_v2" TEXT NOT NULL,
    "encryptedDek" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_securityKeys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "message_securityKeys_messageId_key" ON "message_securityKeys"("messageId");

-- AddForeignKey
ALTER TABLE "message_securityKeys" ADD CONSTRAINT "message_securityKeys_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
