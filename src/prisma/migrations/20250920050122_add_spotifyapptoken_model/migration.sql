/*
  Warnings:

  - You are about to drop the `app_tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."app_tokens";

-- CreateTable
CREATE TABLE "public"."SpotifyAppToken" (
    "id" INTEGER NOT NULL,
    "accessToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpotifyAppToken_pkey" PRIMARY KEY ("id")
);
