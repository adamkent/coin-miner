-- AlterTable
ALTER TABLE "public"."PlayerState" ALTER COLUMN "lastClickAt" DROP NOT NULL,
ALTER COLUMN "lastClickAt" DROP DEFAULT;
