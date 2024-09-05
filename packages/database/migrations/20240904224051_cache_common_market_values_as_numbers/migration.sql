/*
  Warnings:

  - You are about to alter the column `commentCount` on the `Market` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `liquidityCount` on the `Market` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `uniquePromotersCount` on the `Market` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `uniqueTradersCount` on the `Market` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `probability` on the `MarketOption` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Market" ALTER COLUMN "commentCount" SET DATA TYPE INTEGER,
ALTER COLUMN "liquidityCount" SET DATA TYPE INTEGER,
ALTER COLUMN "uniquePromotersCount" SET DATA TYPE INTEGER,
ALTER COLUMN "uniqueTradersCount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "MarketOption" ALTER COLUMN "probability" SET DATA TYPE INTEGER;
