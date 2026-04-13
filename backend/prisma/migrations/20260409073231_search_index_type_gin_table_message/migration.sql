-- CreateIndex
CREATE INDEX "Message_search_index_idx" ON "Message" USING GIN ("search_index");
