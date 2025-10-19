/*
  Warnings:

  - A unique constraint covering the columns `[sessionKey]` on the table `Token` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Token_sessionKey_key" ON "public"."Token"("sessionKey");
