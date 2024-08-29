/*
  Warnings:

  - You are about to drop the column `creatorId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the `TransactionItem` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[ammAccountId]` on the table `Market` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clearingAccountId]` on the table `Market` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[primaryAccountId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Transaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/

-- Create a function to generate CUID-like identifiers
CREATE OR REPLACE FUNCTION generate_cuid() RETURNS TEXT AS $$
DECLARE
    timestamp TEXT;
    counter TEXT;
    random TEXT;
BEGIN
    timestamp := LPAD(TO_HEX(EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT), 8, '0');
    counter := LPAD(TO_HEX((RANDOM() * 1073741824)::INT), 4, '0');
    random := LPAD(TO_HEX((RANDOM() * 9007199254740991)::BIGINT), 12, '0');
    RETURN CONCAT('c', timestamp, counter, random);
END;
$$ LANGUAGE plpgsql;

-- Step 1: Delete existing data
DELETE FROM "TransactionItem";
DELETE FROM "Transaction";
DELETE FROM "Account";

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('TRADE_BUY', 'TRADE_SELL', 'TRADE_WIN', 'TRADE_LOSS', 'CREATOR_TRADER_BONUS', 'LIQUIDITY_INITIALIZE', 'LIQUIDITY_DEPOSIT', 'LIQUIDITY_WITHDRAWAL', 'LIQUIDITY_RETURNED', 'LIQUIDITY_VOLUME_BONUS', 'DAILY_TRADE_BONUS', 'DAILY_MARKET_BONUS', 'DAILY_COMMENT_BONUS', 'DAILY_LIQUIDITY_BONUS', 'HOUSE_GIFT', 'HOUSE_SIGNUP_BONUS');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('CURRENCY', 'MARKET_OPTION');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('USER', 'MARKET_AMM', 'MARKET_CLEARING', 'HOUSE');

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "TransactionItem" DROP CONSTRAINT "TransactionItem_accountId_fkey";

-- DropForeignKey
ALTER TABLE "TransactionItem" DROP CONSTRAINT "TransactionItem_transactionId_fkey";

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "type" "AccountType" NOT NULL;

-- AlterTable
ALTER TABLE "Market" ADD COLUMN     "ammAccountId" TEXT,
ADD COLUMN     "clearingAccountId" TEXT;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "creatorId",
DROP COLUMN "description",
ADD COLUMN     "batchId" TEXT,
ADD COLUMN     "initiatorId" TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" "TransactionType" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "primaryAccountId" TEXT;

-- DropTable
DROP TABLE "TransactionItem";

-- CreateTable
CREATE TABLE "TransactionBatch" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransactionBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionEntry" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "assetType" "AssetType" NOT NULL,
    "assetId" TEXT NOT NULL,
    "fromAccountId" TEXT NOT NULL,
    "toAccountId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Balance" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "assetType" "AssetType" NOT NULL,
    "assetId" TEXT NOT NULL,
    "total" DECIMAL(65,30) NOT NULL,
    "subtotals" JSONB NOT NULL,
    "marketId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Balance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketOptionPosition" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "cost" DECIMAL(65,30) NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketOptionPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MarketOptionToTransaction" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "Balance_accountId_assetType_assetId_marketId_idx" ON "Balance"("accountId", "assetType", "assetId", "marketId");

-- CreateIndex
CREATE UNIQUE INDEX "Balance_accountId_assetType_assetId_marketId_key" ON "Balance"("accountId", "assetType", "assetId", "marketId");

-- CreateIndex
CREATE INDEX "MarketOptionPosition_accountId_optionId_idx" ON "MarketOptionPosition"("accountId", "optionId");

-- CreateIndex
CREATE UNIQUE INDEX "MarketOptionPosition_accountId_optionId_key" ON "MarketOptionPosition"("accountId", "optionId");

-- CreateIndex
CREATE UNIQUE INDEX "_MarketOptionToTransaction_AB_unique" ON "_MarketOptionToTransaction"("A", "B");

-- CreateIndex
CREATE INDEX "_MarketOptionToTransaction_B_index" ON "_MarketOptionToTransaction"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Market_ammAccountId_key" ON "Market"("ammAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Market_clearingAccountId_key" ON "Market"("clearingAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "User_primaryAccountId_key" ON "User"("primaryAccountId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_primaryAccountId_fkey" FOREIGN KEY ("primaryAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Market" ADD CONSTRAINT "Market_ammAccountId_fkey" FOREIGN KEY ("ammAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Market" ADD CONSTRAINT "Market_clearingAccountId_fkey" FOREIGN KEY ("clearingAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "TransactionBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionEntry" ADD CONSTRAINT "TransactionEntry_fromAccountId_fkey" FOREIGN KEY ("fromAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionEntry" ADD CONSTRAINT "TransactionEntry_toAccountId_fkey" FOREIGN KEY ("toAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionEntry" ADD CONSTRAINT "TransactionEntry_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Balance" ADD CONSTRAINT "Balance_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Balance" ADD CONSTRAINT "Balance_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketOptionPosition" ADD CONSTRAINT "MarketOptionPosition_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketOptionPosition" ADD CONSTRAINT "MarketOptionPosition_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketOptionPosition" ADD CONSTRAINT "MarketOptionPosition_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "MarketOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MarketOptionToTransaction" ADD CONSTRAINT "_MarketOptionToTransaction_A_fkey" FOREIGN KEY ("A") REFERENCES "MarketOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MarketOptionToTransaction" ADD CONSTRAINT "_MarketOptionToTransaction_B_fkey" FOREIGN KEY ("B") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
