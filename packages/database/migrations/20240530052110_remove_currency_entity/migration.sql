/*
  Warnings:

  - You are about to drop the column `entityId` on the `Currency` table. All the data in the column will be lost.
  - You are about to drop the column `entityType` on the `Currency` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Currency" DROP COLUMN "entityId",
DROP COLUMN "entityType";

-- DropEnum
DROP TYPE "CurrencyEntityType";
