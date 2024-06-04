/*
  Warnings:

  - You are about to drop the column `currencyId` on the `TransactionItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ammId]` on the table `Market` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `code` on the `Currency` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `ammId` to the `Market` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creatorId` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currencyCode` to the `TransactionItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CurrencyCode" AS ENUM ('PRIMARY', 'YES', 'NO', 'LPB');

-- DropForeignKey
ALTER TABLE "TransactionItem" DROP CONSTRAINT "TransactionItem_currencyId_fkey";

-- AlterTable
ALTER TABLE "Currency" DROP COLUMN "code",
ADD COLUMN     "code" "CurrencyCode" NOT NULL;

-- AlterTable
ALTER TABLE "Market" ADD COLUMN     "ammId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "creatorId" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TransactionItem" DROP COLUMN "currencyId",
ADD COLUMN     "currencyCode" "CurrencyCode" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isAMM" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Currency_code_key" ON "Currency"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Market_ammId_key" ON "Market"("ammId");

-- AddForeignKey
ALTER TABLE "Market" ADD CONSTRAINT "Market_ammId_fkey" FOREIGN KEY ("ammId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
