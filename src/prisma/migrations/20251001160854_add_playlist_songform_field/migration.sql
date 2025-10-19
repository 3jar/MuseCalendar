/*
  Warnings:

  - You are about to drop the column `title` on the `playlists` table. All the data in the column will be lost.
  - Added the required column `songform` to the `playlists` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."SongForm" AS ENUM ('WAKEUP', 'LABOR');

-- AlterTable
ALTER TABLE "public"."playlists" DROP COLUMN "title",
ADD COLUMN     "songform" "public"."SongForm" NOT NULL;
