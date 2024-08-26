/*
  Warnings:

  - You are about to drop the column `currencyCode` on the `MarketOption` table. All the data in the column will be lost.
  - You are about to drop the column `currencyCode` on the `TransactionItem` table. All the data in the column will be lost.
  - You are about to drop the `Currency` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MarketOption" DROP CONSTRAINT "MarketOption_currencyCode_fkey";

-- DropForeignKey
ALTER TABLE "TransactionItem" DROP CONSTRAINT "TransactionItem_currencyCode_fkey";

-- AlterTable
ALTER TABLE "MarketOption" DROP COLUMN "currencyCode";

-- AlterTable
ALTER TABLE "TransactionItem" DROP COLUMN "currencyCode";

-- DropTable
DROP TABLE "Currency";

-- DropEnum
DROP TYPE "CurrencyCode";
