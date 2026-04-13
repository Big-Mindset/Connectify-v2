/*
  Warnings:

  - You are about to drop the column `joinedAt` on the `chat_participant` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `chat_participant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "chat_participant" DROP COLUMN "joinedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "friendship" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;
