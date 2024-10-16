-- AlterTable
ALTER TABLE "Market" ADD COLUMN     "canceledAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "isReverse" BOOLEAN;
