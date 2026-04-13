/*
  Warnings:

  - You are about to drop the column `roles` on the `Chat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "roles";

-- AlterTable
ALTER TABLE "chat_participant" ADD COLUMN     "role" TEXT;
