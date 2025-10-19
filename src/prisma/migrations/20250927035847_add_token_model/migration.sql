/*
  Warnings:

  - You are about to drop the `SpotifyAppToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."TokenProvider" AS ENUM ('SSO', 'SPOTIFY', 'APP');

-- DropTable
DROP TABLE "public"."SpotifyAppToken";

-- CreateTable
CREATE TABLE "public"."Token" (
    "id" TEXT NOT NULL,
    "provider" "public"."TokenProvider" NOT NULL,
    "subject" TEXT NOT NULL,
    "sessionKey" VARCHAR(128),
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "accessTokenExpires" TIMESTAMP(3),
    "refreshTokenExpires" TIMESTAMP(3),
    "scope" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "display_id" INTEGER NOT NULL,
    "birthday" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Token_provider_subject_idx" ON "public"."Token"("provider", "subject");

-- CreateIndex
CREATE INDEX "Token_sessionKey_idx" ON "public"."Token"("sessionKey");

-- CreateIndex
CREATE INDEX "Account_userId_provider_idx" ON "public"."Account"("userId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
