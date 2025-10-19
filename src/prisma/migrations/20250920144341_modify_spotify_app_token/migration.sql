/*
  Warnings:

  - Added the required column `updatedAt` to the `SpotifyAppToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
CREATE SEQUENCE "public".spotifyapptoken_id_seq;
ALTER TABLE "public"."SpotifyAppToken" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" SET DEFAULT nextval('"public".spotifyapptoken_id_seq');
ALTER SEQUENCE "public".spotifyapptoken_id_seq OWNED BY "public"."SpotifyAppToken"."id";
