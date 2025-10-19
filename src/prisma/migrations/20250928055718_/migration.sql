/*
  Warnings:

  - The values [APP] on the enum `TokenProvider` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."TokenProvider_new" AS ENUM ('SSO', 'SPOTIFY', 'SPOTIFY_APP');
ALTER TABLE "public"."Token" ALTER COLUMN "provider" TYPE "public"."TokenProvider_new" USING ("provider"::text::"public"."TokenProvider_new");
ALTER TYPE "public"."TokenProvider" RENAME TO "TokenProvider_old";
ALTER TYPE "public"."TokenProvider_new" RENAME TO "TokenProvider";
DROP TYPE "public"."TokenProvider_old";
COMMIT;
