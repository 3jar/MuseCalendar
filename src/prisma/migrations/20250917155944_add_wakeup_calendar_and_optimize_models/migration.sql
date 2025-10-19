/*
  Warnings:

  - You are about to drop the column `userId` on the `playlists` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[wakeupCalendarId]` on the table `playlists` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[studentId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `wakeupCalendarId` to the `playlists` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "public"."playlists_userId_idx";

-- DropIndex
DROP INDEX "public"."users_email_key";

-- AlterTable
ALTER TABLE "public"."playlists" DROP COLUMN "userId",
ADD COLUMN     "wakeupCalendarId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "email",
ADD COLUMN     "studentId" INTEGER NOT NULL,
ALTER COLUMN "name" SET NOT NULL;

-- CreateTable
CREATE TABLE "public"."WakeupCalendar" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "userId" TEXT,
    "disabled" BOOLEAN NOT NULL,

    CONSTRAINT "WakeupCalendar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WakeupCalendar_userId_idx" ON "public"."WakeupCalendar"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "playlists_wakeupCalendarId_key" ON "public"."playlists"("wakeupCalendarId");

-- CreateIndex
CREATE INDEX "playlists_wakeupCalendarId_idx" ON "public"."playlists"("wakeupCalendarId");

-- CreateIndex
CREATE UNIQUE INDEX "users_studentId_key" ON "public"."users"("studentId");

-- AddForeignKey
ALTER TABLE "public"."playlists" ADD CONSTRAINT "playlists_wakeupCalendarId_fkey" FOREIGN KEY ("wakeupCalendarId") REFERENCES "public"."WakeupCalendar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WakeupCalendar" ADD CONSTRAINT "WakeupCalendar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
