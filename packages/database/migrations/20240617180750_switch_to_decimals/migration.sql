/*
  Warnings:

  - You are about to alter the column `amount` on the `TransactionItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE "TransactionItem" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);
