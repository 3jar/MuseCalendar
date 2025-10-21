/*
  Warnings:

  - A unique constraint covering the columns `[provider,subject]` on the table `Token` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Token_provider_subject_key" ON "public"."Token"("provider", "subject");
