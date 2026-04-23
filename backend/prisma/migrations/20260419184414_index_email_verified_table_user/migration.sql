-- CreateIndex
CREATE INDEX "user_username_emailVerified_idx" ON "user"("username", "emailVerified");

-- CreateIndex
CREATE INDEX "user_username_idx" ON "user"("username");
