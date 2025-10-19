/*
  Warnings:

  - You are about to drop the column `subject` on the `Token` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Token_provider_subject_idx";

-- AlterTable
ALTER TABLE "public"."Token" DROP COLUMN "subject";

-- CreateIndex
CREATE INDEX "Token_provider_id_idx" ON "public"."Token"("provider", "id");
