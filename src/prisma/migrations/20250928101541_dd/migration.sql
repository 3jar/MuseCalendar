/*
  Warnings:

  - Added the required column `subject` to the `Token` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Token_provider_id_idx";

-- AlterTable
ALTER TABLE "public"."Token" ADD COLUMN     "subject" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Token_provider_subject_idx" ON "public"."Token"("provider", "subject");
