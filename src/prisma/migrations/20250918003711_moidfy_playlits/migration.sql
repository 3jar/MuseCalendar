/*
  Warnings:

  - You are about to drop the column `wakeupCalendarId` on the `playlists` table. All the data in the column will be lost.
  - You are about to drop the `WakeupCalendar` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."WakeupCalendar" DROP CONSTRAINT "WakeupCalendar_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."playlists" DROP CONSTRAINT "playlists_wakeupCalendarId_fkey";

-- DropIndex
DROP INDEX "public"."playlists_wakeupCalendarId_idx";

-- DropIndex
DROP INDEX "public"."playlists_wakeupCalendarId_key";

-- AlterTable
ALTER TABLE "public"."playlists" DROP COLUMN "wakeupCalendarId";

-- DropTable
DROP TABLE "public"."WakeupCalendar";
