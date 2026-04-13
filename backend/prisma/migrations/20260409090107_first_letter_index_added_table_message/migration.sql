-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "firstLetters_index" TEXT[];

-- CreateIndex
CREATE INDEX "Message_firstLetters_index_idx" ON "Message"("firstLetters_index");
