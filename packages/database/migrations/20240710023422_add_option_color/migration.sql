-- AlterTable
ALTER TABLE "MarketOption" ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#FF00FF';

UPDATE "MarketOption" SET "color" = '#3B82F6' WHERE "currencyCode" = 'YES';
UPDATE "MarketOption" SET "color" = '#EC4899' WHERE "currencyCode" = 'NO';
