-- DropIndex
DROP INDEX "public"."PlayerState_coins_idx";

-- AlterTable
ALTER TABLE "public"."PlayerState" ADD COLUMN     "lastAutoMinerCollectAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
