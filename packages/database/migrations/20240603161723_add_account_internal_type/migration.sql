/*
  Warnings:

  - A unique constraint covering the columns `[internalType]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "internalType" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Account_internalType_key" ON "Account"("internalType");
