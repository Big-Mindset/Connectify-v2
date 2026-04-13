/*
  Warnings:

  - You are about to drop the column `image` on the `GroupChat` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[groupChatId]` on the table `Media` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[publicKey]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[privateKey]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `groupChatId` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GroupChat" DROP COLUMN "image";

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "groupChatId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "privateKey" TEXT,
ADD COLUMN     "publicKey" TEXT;

-- CreateTable
CREATE TABLE "chat_E2EE_Keys" (
    "id" TEXT NOT NULL,
    "encryptedChatkey" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "chat_E2EE_Keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chat_E2EE_Keys_chatId_userId_idx" ON "chat_E2EE_Keys"("chatId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "chat_E2EE_Keys_chatId_userId_key" ON "chat_E2EE_Keys"("chatId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Media_groupChatId_key" ON "Media"("groupChatId");

-- CreateIndex
CREATE UNIQUE INDEX "user_publicKey_key" ON "user"("publicKey");

-- CreateIndex
CREATE UNIQUE INDEX "user_privateKey_key" ON "user"("privateKey");

-- AddForeignKey
ALTER TABLE "chat_E2EE_Keys" ADD CONSTRAINT "chat_E2EE_Keys_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_E2EE_Keys" ADD CONSTRAINT "chat_E2EE_Keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_groupChatId_fkey" FOREIGN KEY ("groupChatId") REFERENCES "GroupChat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
