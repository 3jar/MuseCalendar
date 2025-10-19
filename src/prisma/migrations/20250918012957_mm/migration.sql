/*
  Warnings:

  - You are about to drop the column `studentId` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `playlists` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."users_studentId_key";

-- AlterTable
ALTER TABLE "public"."playlists" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "studentId",
ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "playlists_userId_idx" ON "public"."playlists"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");
